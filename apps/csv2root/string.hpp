#ifndef _DS_STRING_H
#define _DS_STRING_H

#include <string>
#include <vector>
#include <iterator>

namespace ds {
 template <class T, class CharT = char, class SizeT = std::string::size_type, class Dist = ptrdiff_t> 
 class basic_split_iterator : public std::iterator<std::input_iterator_tag, T, Dist, const T*, const T&> {
  public:
    basic_split_iterator() : str(""), separator('\0') {
	pos = 0;
	nextpos = std::string::npos;
    }

    basic_split_iterator(T& s, CharT ch) : str(s), separator(ch) {
	pos = 0;
	nextpos = str.find_first_of(separator);
    }
    
    T operator*() const {
	if (nextpos == std::string::npos)
	    return str.substr(pos);
	else 
	    return str.substr(pos, nextpos - pos);
    }
/*    
    const T& operator*() const {
    }
    
    const T* operator->() const {
	return &(operator*());
    }
*/    
    basic_split_iterator& operator++() {
	if (nextpos == std::string::npos) pos = 0;
	else {
	    pos = nextpos + 1;
	    nextpos = str.find_first_of(separator, pos + 1);
	}
	return *this;
    }
    
    bool operator==(const basic_split_iterator& i) const {
	return ((nextpos==i.nextpos)&&(pos==i.pos));
    }

    bool operator!=(const basic_split_iterator& i) const {
//	std::cout << nextpos << "=" << i.nextpos << "," << pos << "=" << i.pos << std::endl;
	return ((nextpos!=i.nextpos)||(pos!=i.pos));
    }

  private:
    const T& str;
    const CharT separator;
    SizeT pos;
    SizeT nextpos;
 };

 template < class Ch = char, class Tr = std::char_traits<Ch>, class A = std::allocator<Ch> >
 class basic_csv_string : public std::basic_string<Ch,Tr,A> {
  protected:
    typedef basic_csv_string<Ch, Tr, A> Self;
    typedef std::vector<Self> SelfVector;
    typedef std::basic_string<Ch, Tr, A> Base;

  public:
    typedef typename std::basic_string<Ch, Tr, A>::size_type size_type;

  public:
	/* actually, we need to define all constructors */
    basic_csv_string() : std::basic_string<Ch,Tr,A>() { }
    basic_csv_string(const char *ch) : std::basic_string<Ch,Tr,A>(ch) { }
    basic_csv_string(std::basic_string<Ch, Tr, A> str) : std::basic_string<Ch,Tr,A>(str) { }
    
    template<class InputIterator>
    basic_csv_string(InputIterator __beg, InputIterator __end) : std::basic_string<Ch,Tr,A>(__beg, __end) { }
    

    Self substr(size_type start = 0, size_type leng = 0) const;

    template <class ResT>
    std::vector<ResT> *split(std::vector<ResT> &result, Ch c); 

    basic_split_iterator<Self, Ch> create_split_iterator(Ch c);
 };
 

 typedef class basic_csv_string<char> csv_string;
 typedef class basic_split_iterator<csv_string> split_iterator;
};

using namespace ds;
using namespace std;

template <class Ch, class Tr, class A>
basic_csv_string<Ch,Tr,A> basic_csv_string<Ch,Tr,A>::substr(size_type start, size_type leng) const {
    std::string::size_type len = leng?(leng):(Base::length() - start);

    while ((len>0)&&((at(start) == ' ')||(at(start) == '\t'))) {
	start++; len--;
    }
    
    while ((len>0)&&((at(start+len-1)==' ')||(at(start+len-1)=='\r')||(at(start+len-1)=='\n')||(at(start+len-1)=='\t'))) len--;

    return basic_string<Ch,Tr,A>::substr(start,len);
}

template <class Ch, class Tr, class A> template <class ResT>
vector<ResT> *basic_csv_string<Ch,Tr,A>::split(vector<ResT> &result, Ch c) {
	csv_string::size_type pos, nextpos = basic_csv_string<Ch,Tr,A>::find_first_of(c);
	for (pos = 0; nextpos != string::npos; nextpos = basic_csv_string<Ch,Tr,A>::find_first_of(c, pos + 1)) {
	    csv_string word = substr(pos, nextpos - pos);
/*	    if (word.length()>0)*/ result.push_back(word);
	    pos = nextpos + 1;
	}
	csv_string word = substr(pos);
/*	if (word.length()>0)*/ result.push_back(word);

	return &result;
}

template <class Ch, class Tr, class A>
basic_split_iterator<basic_csv_string<Ch, Tr, A>, Ch> basic_csv_string<Ch,Tr,A>::create_split_iterator(Ch c) {
    return basic_split_iterator<basic_csv_string<Ch, Tr, A>, Ch, typename basic_csv_string<Ch, Tr, A>::size_type>(*this, c);
}

#endif /* _DS_STRING_H */
