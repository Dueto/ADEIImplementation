NAME	      = csv2root
ARCH          = linux

CXX           =
ObjSuf        = o
SrcSuf        = cpp
ExeSuf        =
DllSuf        = so
OutPutOpt     = -o 

OBJECTS		= csv.o csv2root.o
HEADERS		= string.hpp csv.hpp

### NOTE, FOR THE NEXT 3 LINES TO WORK YOU HAVE TO
### HAVE $(ROOTSYS)/bin in your path
ROOTCFLAGS   := $(shell root-config --cflags)
#ROOTLIBS     := $(shell root-config --libs) -lSQL
ROOTLIBS     := $(shell root-config --libs) -lSQLIO
ROOTGLIBS    := $(shell root-config --glibs)

BOOSTCFLAGS  =
BOOSTLIBS    = -lboost_date_time -lboost_program_options -lboost_regex

CXX           = g++
CXXFLAGS      = -O -Wall -fPIC
LD            = g++
LDFLAGS       = -O
SOFLAGS       = -shared

CXXFLAGS     += $(ROOTCFLAGS) $(BOOSTCFLAGS)
LIBS          = $(ROOTLIBS) $(SYSLIBS) $(BOOSTLIBS)
GLIBS         = $(ROOTGLIBS) $(SYSLIBS) $(BOOSTLIBS)

#---------------------------------------------------------------------
TESTO         = $(NAME).$(ObjSuf)
TEST          = $(NAME)$(ExeSuf)

OBJS          =  $(TESTO)

PROGRAMS      = $(TEST)

#---------------------------------------------------------------------
.SUFFIXES: .$(SrcSuf) .$(ObjSuf) .$(DllSuf) 

all:		$(PROGRAMS)


$(TEST):	$(OBJECTS)
		$(LD) $(LDFLAGS) $(OBJECTS) $(LIBS) \
		   $(OutPutOpt)$(TEST)
		@echo "$@ done"

$(OBJECTS):%o:%$(SrcSuf) $(HEADERS)
	$(CXX) $(CXXFLAGS) -c $<

clean ::
	-rm -f *.o
	-rm -f $(TEST)
