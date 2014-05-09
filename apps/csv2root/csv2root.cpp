#include <stdio.h>
#include <unistd.h>

#include <iostream>
#include <vector>
#include <string>

#include <boost/program_options.hpp>
#include <boost/regex.hpp>

#include <boost/lambda/lambda.hpp>
#include <boost/lambda/bind.hpp>

#include <boost/date_time/posix_time/ptime.hpp>
#include <boost/date_time/local_time/local_time.hpp>

#include <TROOT.h>
#include <TFile.h>
#include <TSQLFile.h>
#include <TTree.h>

#include <TCanvas.h>
#include <TH2F.h>
#include <TGraph.h>

#include <boost/algorithm/string/trim.hpp>

#include "csv.hpp"

#define TIME_CORRECTION		788918400
#define SQL_MAXLENGTH		31

using namespace ds;
using namespace std;
using namespace boost;
using namespace boost::program_options;
using namespace boost::lambda;

TTree *get_tree(TFile *f, string &loggroup, time_t &latest) {
    TTree *t = (TTree*)gROOT->FindObject(loggroup.c_str());
    if (t) {
	unsigned long last_entry = t->GetEntries() - 1;
	if (last_entry != (unsigned long)-1) {
	    ULong64_t roottime;
	    t->SetBranchAddress("timestamp", &roottime);
	    if (t->GetEntry(last_entry)) {
		latest = (roottime + TIME_CORRECTION);
		return t;
	    }
	    else throw string("Read request is failed");
	} else throw string("ROOT file is empty");
    } 
    throw string("Invalid ROOT file");
}

void fix_name(string &name, size_t channel, bool fix_length  = false, bool add_prefix = false) {
    regex ichars_re("([(<{\\[])|([})>\\]])|([^\\w\\d_()<>{}\\[\\]])");
    string ichars_replacement("(?1__)(?2__)(?3_)");

    regex block_re(".*\\[([^\\[\\]]+)\\]$");

    if ((add_prefix)&&(channel))
	name = string("c") + lexical_cast<string>(channel) + string("_") + regex_replace(name, ichars_re, ichars_replacement, boost::match_default | boost::format_all);
    else
	name = regex_replace(name, ichars_re, ichars_replacement, boost::match_default | boost::format_all);

    if ((!fix_length)||(name.length() < SQL_MAXLENGTH)) return;
	    
    if (channel) {
	smatch m;
	string prefix = string("c") + lexical_cast<string>(channel);
	if (regex_match(name, m, block_re)) {
	    string tmp = regex_replace(string(m[1].first, m[1].second), ichars_re, ichars_replacement, boost::match_default | boost::format_all);
	    if (tmp.length() < (SQL_MAXLENGTH - prefix.length() - 1))
		name = prefix + string("_") + tmp;
	    else
		name = prefix;
	} else name = prefix;
    } else {
	name = name.substr(0, SQL_MAXLENGTH);
    }
}

void csv2root(TFile *f, string &loggroup, variables_map &vm) {
    time_t timestamp;
    time_t start;
    ULong64_t roottime;
    unsigned long period;
    

    std::size_t n_columns;
    vector<string> headers;

    CSV csv(std::cin);
    
    csv.get_headers(headers);


    n_columns = headers.size() - 1;
    if (n_columns <= 0) invalid_argument("Invalid format");

    typedef std::string (*re_replace_func)(const std::string& s, const regex& e, const std::string& fmt, match_flag_type flags);

    if (vm.count("db")) {
	for (size_t i = 0;i < n_columns; ++i) fix_name(headers[i+1], i+1, true, true);
    } else {
//	for_each(headers.begin(), headers.end(), _1 = bind(static_cast<re_replace_func>(&regex_replace<regex_traits<char>, char >), _1, ichars_re, ichars_replacement, boost::match_default | boost::format_all));
	for (size_t i = 0;i < n_columns; ++i) fix_name(headers[i+1], i+1, false, true);
    }


    auto_ptr<double> column_ptr(new double[n_columns]);
    double *column = column_ptr.get();

    auto_ptr<TTree> tree_ptr;
    TTree *tree;
    
    if (vm.count("overwrite")) {
	start = 0;
	tree = NULL;
    } else {
	try {
	    tree = get_tree(f, loggroup, start);
	} catch (...) {
	    start = 0;
	    tree = NULL;
	}
    }
    
    if (tree) {
	TBranch *b = tree->GetBranch("timestamp");
	b->SetAddress(&roottime);
	
	for (size_t i = 0;i < n_columns; ++i) {
    	    TBranch *b = tree->GetBranch(headers[i+1].c_str());
	    b->SetAddress(&column[i]);
	}
    } else {
        tree_ptr = auto_ptr<TTree>(new TTree(loggroup.c_str(), "ADEI Data"));
	tree = tree_ptr.get();

	if (vm.count("group")) tree->SetTitle(vm["group"].as<string>().c_str());
	
	tree->Branch("timestamp", &roottime, "timestamp/l");
	for (size_t i = 0;i < n_columns; ++i) {
    	    tree->Branch(headers[i+1].c_str(), &column[i], "s1/D");
	}
    }

    if (!csv.get_row(timestamp, n_columns, column)) return;
    
    time_t from = timestamp;
    do {	
	if (timestamp > start) {
	    roottime = timestamp - TIME_CORRECTION; /* ROOT time starts at 1/1/95 */
	    tree->Fill();
	}
    } while (csv.get_row(timestamp, n_columns, column));
    period = timestamp - from;

    tree->Write(0, TObject::kOverwrite); // We don't supply a file, the default is used

    if (vm.count("save-histograms")) {
	const char *time_format;

	if (period > 126144000) time_format = "%Y";
	else if (period > 31536000) time_format = "%b %Y";
	else if (period > 10368000) time_format = "%b";
	else if (period > 345600) time_format = "%b %d";
	else if (period > 86400) time_format = "%b %d-%H:%M";
	else if (period > 1200) time_format = "%H:%M";
	else time_format = "%H:%M:%S";
	
	f->mkdir("Histograms");
	f->cd("Histograms");
	
	for (size_t i = 0; i < n_columns; i++) {
	    TCanvas c(headers[i+1].c_str());
	    string hname("hist" + lexical_cast<string>(i));
	    string gname("graph" + lexical_cast<string>(i));
	    
	    tree->Draw((headers[i+1] + string(":timestamp>>") + hname).c_str(), "", "LIST"); /* cut, type[, number, from] */
	    TGraph *gr = (TGraph*)gPad->GetPrimitive("Graph");
	    if (gr) {
	        gr->SetName(gname.c_str());
		gr->SetDrawOption("P LIST");
	     } else
		throw("Can't find created graphic");
	    
	    TH2F *h = (TH2F*)gPad->GetPrimitive(hname.c_str());
	    if (h) {
		h->GetXaxis()->SetTimeDisplay(1);
		h->GetXaxis()->SetTimeFormat(time_format);
	    } else
		throw("Can't find created histogram");
    
	    c.Write();
	}
	f->cd();

    	if (vm.count("combined-histogram")) {
	    TCanvas c("Combined Histogram");
    
	    double min = 1E+10;
	    double max = -1E+10;
	    
	    for (size_t i = 0; i < n_columns; i++) {
		if (i) {
		    tree->Draw((headers[i+1] + string(":timestamp")).c_str(), "", "P LIST SAME");
		} else {
		    tree->Draw((headers[i+1] + string(":timestamp>>combined_hist")).c_str(), "", "P LIST");
		}
    
		TGraph *gr = (TGraph*)gPad->GetPrimitive("Graph");
		if (!gr) throw("Can't find created graphic");
		
		gr->SetName(headers[i+1].c_str());
	        gr->SetDrawOption("P LIST");
		gr->SetLineColor(i%14+2);
		gr->SetMarkerColor(i%14+2);
//		gr->SetMarkerStyle(20);
//		gr->SetMarkerSize(1);
//		gr->SetLineWidth(1);

		double cmin = gr->GetYaxis()->GetXmin();
		double cmax = gr->GetYaxis()->GetXmax();
		if (cmin < min) min = cmin;
		if (cmax > max) max = cmax;
	    }
	    
	    TH2F *h = (TH2F*)gPad->GetPrimitive("combined_hist");
	    if (!h) throw("Can't find created histogram");
		    
	    h->GetXaxis()->SetTimeDisplay(1);
	    h->GetXaxis()->SetTimeFormat(time_format);
	    h->GetYaxis()->SetRangeUser((int)min, (int)max+1);
	    c.Write();
	}

    }
}


int main(int argc, char *argv[]) {
    TFile *root_file;
    string loggroup;
    bool inquiry;
    
    options_description opts("options");
    opts.add_options()	/* returns operator() which handles next lines */
	("help,h", "Usage info")
	("file,f", program_options::value<string>(), "ROOT file to use")
	("db,d", program_options::value<string>(), "Database to use")
	("group,g", program_options::value<string>(), "ADEI LogGroup Name")
	("overwrite,o", "Overwrite if file already exists")
	("save-histograms,s", "Prepare and save histograms in ROOT file")
	("combined-histogram,c", "Save additionaly combined histogram")
	("inquiry-latest-data,i", "Output latest data available in the ROOT file")
    ;

    variables_map vm;
    
    try {
	store(parse_command_line(argc, argv, opts), vm);
    } catch (boost::program_options::unknown_option &e) {
	cerr << opts << endl;
	cerr << "ERROR: " << e.what() << endl;
	exit(1);
    }
    
    if (vm.count("help")) {
	cout << opts << endl;
	exit(0);
    }

    if ((vm.count("combined-histogram"))&&(!(vm.count("save-histograms")))) {
	vm.insert(make_pair("save-histograms", variable_value(any(string()), true)));
    }

    if (vm.count("inquiry-latest-data")) inquiry = 1;
    else inquiry = 0;

    if (vm.count("group")) {
	loggroup = vm["group"].as<string>();
	fix_name(loggroup, 0, true, false);
    } else 
	loggroup = string("ADEI");

    if (vm.count("db")) {
	string user;
	string pass;

	if (!vm.count("group")) {
	    cerr << "ERROR: The group name should be specified" << endl;
	    exit(2);
	}
	
        if ((!std::getline(cin, user, '\n'))||(!std::getline(cin, pass, '\n'))) {
	    cerr << "ERROR: Can't parse user name and password" << endl;
	    exit(3);
	}

	if (vm.count("save-histograms")) {
	    cerr << opts << endl;
	    cerr << "ERROR: Storage of histograms in database is not allowed" << endl;
	    exit(4);
	}

	if (inquiry) 
	    root_file = new TSQLFile(vm["db"].as<string>().c_str(), "READ", user.c_str(), pass.c_str());
	else
	    root_file = new TSQLFile(vm["db"].as<string>().c_str(), "UPDATE", user.c_str(), pass.c_str());
    } else if (vm.count("file")) {
	bool existing = false;	

	FILE *f = fopen(vm["file"].as<string>().c_str(), "r");
	if (f) {
	    existing = true;
	    fclose(f);
	}

	f = fopen(vm["file"].as<string>().c_str(), "a+");
	if (f) {
	    fclose(f);
	    if (!existing) unlink(vm["file"].as<string>().c_str());
	} else {
	    cerr << "ERROR: Can't access specified file" << endl;
	    exit(5);
	}

	if (inquiry) 
	    root_file = new TFile(vm["file"].as<string>().c_str(), "READ");
	else {
	    if (vm.count("overwrite")) {
		root_file = new TFile(vm["file"].as<string>().c_str(), "RECREATE");
	    } else {
		root_file = new TFile(vm["file"].as<string>().c_str(), "UPDATE");

		if (vm.count("save-histograms")) {
		    cerr << opts << endl;
		    cerr << "ERROR: You should enable overwrite mode in order to generate histograms" << endl;
		    exit(6);
		}
	    }
	}
//	root_file.Open doesn't open file inside file pointer
//	root_file.Open(vm["file"].as<string>().c_str(), "UPDATE");
    } else {
	cerr << opts << endl;
	cerr << "ERROR: Please submit the temporary file name" << endl;
	exit(8);
    }

    if (vm.count("inquiry-latest-data")) {
	if ((!vm.count("file"))&&(!vm.count("db"))) {
	    cerr << opts << endl;
	    cerr << "ERROR: The file or db option is mandatory" << endl;
	    exit(9);
	}
    }

    if (inquiry) {
	if (vm.count("inquiry-latest-data")) {
	    try {
		time_t t;
		get_tree(root_file, loggroup, t);
		cout << t << endl;
	    } catch (string e) {
		cout << -1 << endl;
		cerr << e << endl;
	    }
	}
    } else {
	try {
	    csv2root(root_file, loggroup,  vm);
	} catch (char const *msg) {
	    cerr << "ERROR: " << msg << endl;
	}
    }

    root_file->Close();
    delete root_file;

    return 0;
}
