#   the used tools
APXS=/usr/sbin/apxs2
APACHECTL=apachectl

NAME = mod_root2
INCLUDES =
CFLAGS =
LIBS = 

all: $(NAME)


$(NAME): $(NAME).c $(INCLUDES)
	$(APXS) -c $(CLFAGS) $(LIBS) $(NAME).c

install: all
	apxs -i -c $(NAME).c

#   cleanup
clean:
	-rm -rf mod_root2.so mod_root2.o *.la *.lo *.slo .libs

#   simple test
test: reload
	lynx -mime_header http://localhost/opc/hell.opc

#   reload the module by installing and restarting Apache
reload: install restart

#   the general Apache start/restart/stop procedures
start:
	$(APACHECTL) start
restart:
	$(APACHECTL) restart
stop:
	$(APACHECTL) stop

