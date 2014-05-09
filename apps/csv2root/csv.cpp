#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>

#include <boost/algorithm/string/classification.hpp>
#include <boost/algorithm/string/split.hpp>
#include <boost/algorithm/string/trim.hpp>
#include <boost/lambda/lambda.hpp>
#include <boost/lambda/bind.hpp>
#include <boost/lexical_cast.hpp>

#include <boost/date_time/time_formatting_streams.hpp>
#include <boost/date_time/local_time/local_time.hpp>
#include <boost/date_time/local_time/local_time_io.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>
#include <boost/date_time/microsec_time_clock.hpp>
#include <boost/date_time/c_local_time_adjustor.hpp>
#include <boost/date_time/local_time_adjustor.hpp>

#include "csv.hpp"

using namespace ds;
using namespace std;

using namespace boost;
using namespace boost::lambda;
using namespace boost::date_time;
using namespace boost::local_time;
using namespace boost::posix_time;

typedef boost::split_iterator<string::iterator> string_split_iterator;


template <class EC>
void CSVCustom<EC>::set_date_format(string &format) {
    date_format = format;    
}


template <class EC>
void CSVCustom<EC>::get_headers(std::vector<string> &headers) {
    csv_string s;
    
    if (std::getline(*CSVCustom<EC>::csv_stream, s, '\n')) {
	s.split(headers, ',');
    } else {
	throw invalid_argument("No data is supplied");
    }
}

template <class EC>
void CSVCustom<EC>::parse_time(boost::posix_time::ptime &parsed_time, std::string &string_time) {
    boost::date_time::time_input_facet<ptime,char> *csv_facet = new boost::date_time::time_input_facet<ptime,char>(date_format);
    std::locale csv_time_locale(std::locale::classic(), csv_facet);

    stringstream ss(string_time);
    ss.exceptions(std::ios_base::failbit);
    ss.imbue(csv_time_locale);
    ss >> parsed_time;
}


template <class EC>
bool CSVCustom<EC>::get_row(boost::posix_time::ptime &header, vector<EC> &data) {
    csv_string s;

    data.clear();
    
    while (std::getline(*CSVCustom<EC>::csv_stream, s, '\n')) {
	ds::split_iterator i = s.create_split_iterator(',');
	if (i == ds::split_iterator()) continue;
	
	csv_string s1 = *i;
	parse_time(header, s1);

	for (++i; i!=ds::split_iterator(); ++i) {
	    data.push_back(lexical_cast<EC>(*i));
	}
	return true;
    }
    return false;
}

template <class EC>
bool CSVCustom<EC>::get_row(boost::posix_time::ptime &header, std::size_t n_columns, EC *column) {
    csv_string s;

    while (std::getline(*CSVCustom<EC>::csv_stream, s, '\n')) {
	ds::split_iterator i = s.create_split_iterator(',');
	if (i == ds::split_iterator()) continue;
	
	csv_string s1 = *i;
	parse_time(header, s1);

	size_t counter = 0;
	for (++i; i != ds::split_iterator(); ++i, ++counter) {
	    if (counter == n_columns) break;
	    column[counter] = lexical_cast<EC>(*i);
	}
	
	for (;counter < n_columns; ++counter) {
	    column[counter] = lexical_cast<EC>(0);
	}
	
	return true;
    }
    return false;
}


template <class EC>
bool CSVCustom<EC>::get_row(time_t &header, vector<EC> &data) {
    boost::posix_time::ptime cpp_time;
    if (get_row(cpp_time, data)) {
//	header = mktime(&to_tm(tm));
	boost::posix_time::ptime epoch(boost::gregorian::date(1970,1,1));
	header = (cpp_time - epoch).total_seconds();
	return true;
    }
    return false;    
}

template <class TElement>
bool CSVCustom<TElement>::get_row(time_t &header, std::size_t n_columns, TElement *column) {
    boost::posix_time::ptime cpp_time;
    if (get_row(cpp_time, n_columns, column)) {
	boost::posix_time::ptime epoch(boost::gregorian::date(1970,1,1));
	header = (cpp_time - epoch).total_seconds();
	return true;
    }
    return false;    
}


template <class EC>
bool CSVCustom<EC>::skip_rows(boost::posix_time::ptime to) {
    return false;
}


template class CSVCustom<>;
