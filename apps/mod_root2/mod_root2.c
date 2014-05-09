/* ====================================================================
 * Copyright (c) 1997,2006 Fons Rademakers.
 * Author: Fons Rademakers  15/1/97
 *
 * Modified: Torre Wenaus, make it work for Apache 1.3.3 (Apache API
 *           prepends now ap_ to names).
 *
 * Rewrite: Fons Rademakers, port to Apache 2.0.
 *
 * To build and install this module in a running Apache 2.x server do:
 *    apxs -c mod_root2.c
 * if this succeeds, become superuser and do:
 *    apxs -i -c mod_root2.c
 * this will install the compiled module module in the Apache modules directory.
 * Next add the file root2.conf to /etc/httpd/conf.d/, this file contains the
 * three lines:
 *    LoadModule root_module modules/mod_root2.so
 *    AddHandler mod-root2 .root
 *    AddHandler mod-root2 .zip
 * the last line is only needed if you want to support ZIP files containing
 * ROOT files.
 * Finally restart Apache using:
 *    apachectl restart
 */


#include <apr_strings.h>
#include <ap_config.h>
#include <httpd.h>
#include <http_config.h>
#include <http_protocol.h>
#include <http_log.h>
#include <util_script.h>
#include <http_main.h>
#include <http_request.h>

static int root_handler(request_rec *r)
{
   conn_rec *c = r->connection;
   apr_file_t *f = NULL;
   apr_status_t rv;

   if (strcmp(r->handler, "mod-root2"))
      return DECLINED;

   r->allowed |= (AP_METHOD_BIT << M_GET);
   if (r->method_number != M_GET)
      return DECLINED;
   if (r->finfo.filetype == 0) {
      ap_log_rerror(APLOG_MARK, APLOG_ERR, 0, r,
                    "File does not exist: %s", r->filename);
      return HTTP_NOT_FOUND;
   }

   if ((rv = apr_file_open(&f, r->filename, APR_READ,
                           APR_OS_DEFAULT, r->pool)) != APR_SUCCESS) {
      ap_log_rerror(APLOG_MARK, APLOG_ERR, rv, r,
                    "File permissions deny server access: %s", r->filename);
      return HTTP_FORBIDDEN;
   }

   if (!r->args || strlen(r->args) == 0) {
      ap_log_rerror(APLOG_MARK, APLOG_ERR, 0, r,
                    "mod_root2: no argument specified for %s", r->filename);
      apr_file_close(f);
      return HTTP_INTERNAL_SERVER_ERROR;
   }

   if (!r->header_only) {
      apr_bucket_brigade *bb;
      apr_bucket *b;
      apr_off_t offset;
      apr_size_t length;
      int n, i = 0;
      char *ctx, *s;

      bb = apr_brigade_create(r->pool, c->bucket_alloc);

      if (strchr(r->args, ':') == 0) {
         n = sscanf(r->args, "%ld", &length);
         if (length == -1) {
            /* return file size */
            apr_finfo_t finfo;
            rv = apr_file_info_get(&finfo, APR_FINFO_SIZE, f);
            if (rv != APR_SUCCESS) {
               ap_log_rerror(APLOG_MARK, APLOG_ERR, rv, r,
                             "mod_root2: cannot get size of file: %s", r->filename);
               apr_file_close(f);
               return HTTP_INTERNAL_SERVER_ERROR;
            }
            apr_brigade_printf(bb, NULL, NULL, "%ld", finfo.size);
            b = apr_bucket_eos_create(c->bucket_alloc);
            APR_BRIGADE_INSERT_TAIL(bb, b);
            rv = ap_pass_brigade(r->output_filters, bb);
            if (rv != APR_SUCCESS) {
               ap_log_rerror(APLOG_MARK, APLOG_ERR, rv, r,
                             "mod_root2: ap_pass_brigade failed for file %s of size %ld", r->filename, finfo.size);
               apr_file_close(f);
               return HTTP_INTERNAL_SERVER_ERROR;
            }
            apr_file_close(f);
            return OK;
         }
         ap_log_rerror(APLOG_MARK, APLOG_ERR, 0, r,
                       "mod_root2: no valid argument specified for %s", r->filename);
         apr_file_close(f);
         return HTTP_INTERNAL_SERVER_ERROR;
      }

      for (s = apr_strtok(r->args, ",", &ctx); s; s = apr_strtok(NULL, ",", &ctx)) {

         n = sscanf(s, "%ld:%ld", &offset, &length);

         /* some sanity checks */
         if (n != 2 || offset < 0 || length <= 0) {
            ap_log_rerror(APLOG_MARK, APLOG_ERR, 0, r,
                          "mod_root2: invalid offset or length specified for %s", r->filename);
            apr_file_close(f);
            return HTTP_INTERNAL_SERVER_ERROR;
         }

         if (i == 0) {
            b = apr_bucket_file_create(f, offset, length,
                                       r->pool, c->bucket_alloc);
         } else {
            apr_bucket_copy(b, &b);
            b->start = offset;
            b->length = length;
         }
         i++;

#if APR_HAS_LARGE_FILES
         if (length > AP_MAX_SENDFILE) {
            /*
             * APR_HAS_LARGE_FILES issue; must split into mutiple buckets,
             * no greater than MAX(apr_size_t), and more granular than that
             * in case the brigade code/filters attempt to read it directly.
             */
            apr_off_t fsize = length;
            b->length = AP_MAX_SENDFILE;
            while (fsize > AP_MAX_SENDFILE) {
               APR_BRIGADE_INSERT_TAIL(bb, b);
               apr_bucket_copy(b, &b);
               b->start += AP_MAX_SENDFILE;
               fsize -= AP_MAX_SENDFILE;
            }
            b->length = (apr_size_t)fsize; /* Resize just the last bucket */
         }
#endif

         APR_BRIGADE_INSERT_TAIL(bb, b);
      }
      b = apr_bucket_eos_create(c->bucket_alloc);
      APR_BRIGADE_INSERT_TAIL(bb, b);
      rv = ap_pass_brigade(r->output_filters, bb);
      if (rv != APR_SUCCESS) {
         ap_log_rerror(APLOG_MARK, APLOG_ERR, rv, r,
                       "mod_root2: ap_pass_brigade failed for file %s", r->filename);
         apr_file_close(f);
         return HTTP_INTERNAL_SERVER_ERROR;
      }
   }
   apr_file_close(f);

   return OK;
}

static void register_hooks(apr_pool_t *p)
{
   ap_hook_handler(root_handler, NULL, NULL, APR_HOOK_MIDDLE);
}

module AP_MODULE_DECLARE_DATA root_module =
{
   STANDARD20_MODULE_STUFF,
   NULL,                        /* create per-directory config structure */
   NULL,                        /* merge per-directory config structures */
   NULL,                        /* create per-server config structure */
   NULL,                        /* merge per-server config structures */
   NULL,                        /* command apr_table_t */
   register_hooks               /* register hooks */
};

