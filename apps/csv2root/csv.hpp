#ifndef _DS_CSV_H
#define _DS_CSV_H

#include <iostream>
#include <vector>
#include <string>

#include <boost/date_time/posix_time/ptime.hpp>

#include "string.hpp"

/* We are expecting the time in CSV to be in GMT using following format (Excel
compatible): 31-Jan-07 23:59:59 */

namespace ds {
 template <class TElement = double>
 class CSVCustom {
    std::istream *csv_stream;
    std::string date_format;

  public:
    CSVCustom(std::istream &in) : date_format("%d-%b-%y %H:%M:%S") {
	csv_stream = &in;
    }
    
    void set_date_format(string &format);
    void parse_time(boost::posix_time::ptime &parsed_time, std::string &string_time);
    
    
    void get_headers(std::vector<std::string> &headers);    
    bool skip_rows(boost::posix_time::ptime to);
    bool get_row(boost::posix_time::ptime &header, vector<TElement> &data);
    bool get_row(boost::posix_time::ptime &header, std::size_t n_columns, TElement *column);
    bool get_row(time_t &header, vector<TElement> &data);
    bool get_row(time_t &header, std::size_t n_columns, TElement *column);
 };
 
 typedef CSVCustom<> CSV;
};

#endif /* _DS_CSV_H */
