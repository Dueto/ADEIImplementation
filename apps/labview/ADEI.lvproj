<?xml version='1.0'?>
<Project Type="Project" LVVersion="8508002">
   <Item Name="My Computer" Type="My Computer">
      <Property Name="server.app.propertiesEnabled" Type="Bool">true</Property>
      <Property Name="server.control.propertiesEnabled" Type="Bool">true</Property>
      <Property Name="server.tcp.enabled" Type="Bool">false</Property>
      <Property Name="server.tcp.port" Type="Int">0</Property>
      <Property Name="server.tcp.serviceName" Type="Str">My Computer/VI Server</Property>
      <Property Name="server.tcp.serviceName.default" Type="Str">My Computer/VI Server</Property>
      <Property Name="server.vi.callsEnabled" Type="Bool">true</Property>
      <Property Name="server.vi.propertiesEnabled" Type="Bool">true</Property>
      <Property Name="specify.custom.address" Type="Bool">false</Property>
      <Item Name="types" Type="Folder">
         <Item Name="ADEIGroup.ctl" Type="VI" URL="ADEIGroup.ctl"/>
         <Item Name="ADEIElement.ctl" Type="VI" URL="ADEIElement.ctl"/>
         <Item Name="ADEIGroupData.ctl" Type="VI" URL="ADEIGroupData.ctl"/>
         <Item Name="ADEIData.ctl" Type="VI" URL="ADEIData.ctl"/>
         <Item Name="ADEIWindow.ctl" Type="VI" URL="ADEIWindow.ctl"/>
         <Item Name="ADEISampling.ctl" Type="VI" URL="ADEISampling.ctl"/>
      </Item>
      <Item Name="library" Type="Folder">
         <Item Name="adeiURL.vi" Type="VI" URL="adeiURL.vi"/>
         <Item Name="adeiServiceURL.vi" Type="VI" URL="adeiServiceURL.vi"/>
         <Item Name="adeiListGroups.vi" Type="VI" URL="adeiListGroups.vi"/>
         <Item Name="adeiServiceGetValueNodes.vi" Type="VI" URL="adeiServiceGetValueNodes.vi"/>
         <Item Name="nodeGetAttributes.vi" Type="VI" URL="nodeGetAttributes.vi"/>
         <Item Name="xmlParse.vi" Type="VI" URL="xmlParse.vi"/>
         <Item Name="adeiListElements.vi" Type="VI" URL="adeiListElements.vi"/>
         <Item Name="adeiListMasks.vi" Type="VI" URL="adeiListMasks.vi"/>
         <Item Name="adeiListItems.vi" Type="VI" URL="adeiListItems.vi"/>
         <Item Name="adeiGetData.vi" Type="VI" URL="adeiGetData.vi"/>
         <Item Name="adeiListServiceURL.vi" Type="VI" URL="adeiListServiceURL.vi"/>
         <Item Name="chomp.vi" Type="VI" URL="chomp.vi"/>
         <Item Name="adeiHTTP.vi" Type="VI" URL="adeiHTTP.vi"/>
         <Item Name="adeiFilterOutdated.vi" Type="VI" URL="adeiFilterOutdated.vi"/>
         <Item Name="adeiDataToGraph.vi" Type="VI" URL="adeiDataToGraph.vi"/>
      </Item>
      <Item Name="express" Type="Folder" URL="express">
         <Property Name="NI.DISK" Type="Bool">true</Property>
      </Item>
      <Item Name="controls" Type="Folder" URL="controls">
         <Property Name="NI.DISK" Type="Bool">true</Property>
      </Item>
      <Item Name="adeiTest.vi" Type="VI" URL="adeiTest.vi"/>
      <Item Name="maskArray.vi" Type="VI" URL="maskArray.vi"/>
      <Item Name="adeiConfig.vi" Type="VI" URL="adeiConfig.vi"/>
      <Item Name="Dependencies" Type="Dependencies">
         <Item Name="vi.lib" Type="Folder">
            <Item Name="No MacOSX NC Error.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/tcputil.llb/No MacOSX NC Error.vi"/>
            <Item Name="FTP Check Reply.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp2.llb/FTP Check Reply.vi"/>
            <Item Name="HTTP Reply To Error.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/http/http1.llb/HTTP Reply To Error.vi"/>
            <Item Name="Base64 Encode.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/strutil.llb/Base64 Encode.vi"/>
            <Item Name="Build HTTP Authorization Header.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/url/url.llb/Build HTTP Authorization Header.vi"/>
            <Item Name="compatCalcOffset.vi" Type="VI" URL="/&lt;vilib&gt;/_oldvers/_oldvers.llb/compatCalcOffset.vi"/>
            <Item Name="compatFileDialog.vi" Type="VI" URL="/&lt;vilib&gt;/_oldvers/_oldvers.llb/compatFileDialog.vi"/>
            <Item Name="OpnCrtRep File.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/strutil.llb/OpnCrtRep File.vi"/>
            <Item Name="Remap EOLN.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/strutil.llb/Remap EOLN.vi"/>
            <Item Name="No EOC Error.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/tcputil.llb/No EOC Error.vi"/>
            <Item Name="No Time Out Error.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/tcputil.llb/No Time Out Error.vi"/>
            <Item Name="compatWriteText.vi" Type="VI" URL="/&lt;vilib&gt;/_oldvers/_oldvers.llb/compatWriteText.vi"/>
            <Item Name="TCP Read Stream.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/tcputil.llb/TCP Read Stream.vi"/>
            <Item Name="TCP Buffered Read.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/tcputil.llb/TCP Buffered Read.vi"/>
            <Item Name="Case Matching.ctl" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/strutil.llb/Case Matching.ctl"/>
            <Item Name="Get Wildcard Search Pattern.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/strutil.llb/Get Wildcard Search Pattern.vi"/>
            <Item Name="Get Case Matching.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/strutil.llb/Get Case Matching.vi"/>
            <Item Name="Get Case Insensitive Search Pattern.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/strutil.llb/Get Case Insensitive Search Pattern.vi"/>
            <Item Name="Get Literal Search Pattern.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/strutil.llb/Get Literal Search Pattern.vi"/>
            <Item Name="Replace Substring.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/strutil.llb/Replace Substring.vi"/>
            <Item Name="CGI Build Unix Path.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/http/cgi.llb/CGI Build Unix Path.vi"/>
            <Item Name="HTTP Parse Reply Header.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/url/url.llb/HTTP Parse Reply Header.vi"/>
            <Item Name="TCP Write Entire Buffer.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/tcputil.llb/TCP Write Entire Buffer.vi"/>
            <Item Name="Parse URL.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/url/url.llb/Parse URL.vi"/>
            <Item Name="URL Get HTTP Document.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/url/url.llb/URL Get HTTP Document.vi"/>
            <Item Name="XML Generate Error Cluster.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/dom/dom.llb/XML Generate Error Cluster.vi"/>
            <Item Name="XML Open.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/dom/dom.llb/XML Open.vi"/>
            <Item Name="XML Load Document.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/dom/dom.llb/XML Load Document.vi"/>
            <Item Name="CGI Unescape HTTP Param.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/http/cgi.llb/CGI Unescape HTTP Param.vi"/>
            <Item Name="Build Gopher Request.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/url/url.llb/Build Gopher Request.vi"/>
            <Item Name="URL Get Gopher Document.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/url/url.llb/URL Get Gopher Document.vi"/>
            <Item Name="Semaphore RefNum" Type="VI" URL="/&lt;vilib&gt;/Utility/semaphor.llb/Semaphore RefNum"/>
            <Item Name="Semaphore Action.ctl" Type="VI" URL="/&lt;vilib&gt;/Utility/semaphor.llb/Semaphore Action.ctl"/>
            <Item Name="Semaphore Size DB.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/semaphor.llb/Semaphore Size DB.vi"/>
            <Item Name="Semaphore Core.vi" Type="VI" URL="/&lt;vilib&gt;/Platform/synch.llb/Semaphore Core.vi"/>
            <Item Name="Destroy Semaphore.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/semaphor.llb/Destroy Semaphore.vi"/>
            <Item Name="FTP Session Data.ctl" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Session Data.ctl"/>
            <Item Name="FTP Session Destructor.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Session Destructor.vi"/>
            <Item Name="FTP Session.ctl" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Session.ctl"/>
            <Item Name="FTP Registry.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Registry.vi"/>
            <Item Name="Get Semaphore Status.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/semaphor.llb/Get Semaphore Status.vi"/>
            <Item Name="Release Semaphore_71.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/semaphor.llb/Release Semaphore_71.vi"/>
            <Item Name="Close Panel.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/victl.llb/Close Panel.vi"/>
            <Item Name="Open Panel.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/victl.llb/Open Panel.vi"/>
            <Item Name="FTP Status" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp2.llb/FTP Status"/>
            <Item Name="TCP Read xTP Reply.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/tcputil.llb/TCP Read xTP Reply.vi"/>
            <Item Name="FTP Get Command Reply.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Get Command Reply.vi"/>
            <Item Name="Acquire Semaphore.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/semaphor.llb/Acquire Semaphore.vi"/>
            <Item Name="Get FTP Session Info.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/Get FTP Session Info.vi"/>
            <Item Name="FTP Command.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp2.llb/FTP Command.vi"/>
            <Item Name="FTP [QUIT].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [QUIT].vi"/>
            <Item Name="FTP Close Session.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Close Session.vi"/>
            <Item Name="FTP Reply To Error.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Reply To Error.vi"/>
            <Item Name="Merge Errors.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Merge Errors.vi"/>
            <Item Name="FTP Validate Data Connection.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Validate Data Connection.vi"/>
            <Item Name="FTP [PORT].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [PORT].vi"/>
            <Item Name="TCP Create Arbitrary Listener.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/tcputil.llb/TCP Create Arbitrary Listener.vi"/>
            <Item Name="FTP [PASV].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [PASV].vi"/>
            <Item Name="FTP Type.ctl" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Type.ctl"/>
            <Item Name="FTP [TYPE].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [TYPE].vi"/>
            <Item Name="FTP Open Data Connection.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Open Data Connection.vi"/>
            <Item Name="FTP Data Receive.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Data Receive.vi"/>
            <Item Name="FTP Append Opt Paramters.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp2.llb/FTP Append Opt Paramters.vi"/>
            <Item Name="FTP [LIST].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [LIST].vi"/>
            <Item Name="FTP [RETR].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [RETR].vi"/>
            <Item Name="Unescape Double Quotes.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/Unescape Double Quotes.vi"/>
            <Item Name="FTP [PWD].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [PWD].vi"/>
            <Item Name="FTP [CWD].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [CWD].vi"/>
            <Item Name="FTP [ACCT].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [ACCT].vi"/>
            <Item Name="FTP [PASS].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [PASS].vi"/>
            <Item Name="FTP [USER].vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp1.llb/FTP [USER].vi"/>
            <Item Name="Keyed Array Map String.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/keyedarr.llb/Keyed Array Map String.vi"/>
            <Item Name="Keyed Array.ctl" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/keyedarr.llb/Keyed Array.ctl"/>
            <Item Name="Keyed Array Index.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/keyedarr.llb/Keyed Array Index.vi"/>
            <Item Name="Keyed Array Add.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/keyedarr.llb/Keyed Array Add.vi"/>
            <Item Name="Get INI Section.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/inifile.llb/Get INI Section.vi"/>
            <Item Name="compatReadText.vi" Type="VI" URL="/&lt;vilib&gt;/_oldvers/_oldvers.llb/compatReadText.vi"/>
            <Item Name="Read Entire File.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/strutil.llb/Read Entire File.vi"/>
            <Item Name="Read INI File.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/inifile.llb/Read INI File.vi"/>
            <Item Name="Read Internet INI.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/utils/inifile.llb/Read Internet INI.vi"/>
            <Item Name="FTP Use Defaults.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp2.llb/FTP Use Defaults.vi"/>
            <Item Name="FTP Logon.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp2.llb/FTP Logon.vi"/>
            <Item Name="whitespace.ctl" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/whitespace.ctl"/>
            <Item Name="Trim Whitespace.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Trim Whitespace.vi"/>
            <Item Name="Error Cluster From Error Code.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Error Cluster From Error Code.vi"/>
            <Item Name="Validate Semaphore Size.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/semaphor.llb/Validate Semaphore Size.vi"/>
            <Item Name="Create Semaphore.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/semaphor.llb/Create Semaphore.vi"/>
            <Item Name="Not An FTP Session.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/Not An FTP Session.vi"/>
            <Item Name="FTP Open Session.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/ftp/ftp0.llb/FTP Open Session.vi"/>
            <Item Name="URL Get FTP Document.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/url/url.llb/URL Get FTP Document.vi"/>
            <Item Name="URL Get Document.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/url/url.llb/URL Get Document.vi"/>
            <Item Name="DOMUserDefRef.dll" Type="Document" URL="/&lt;vilib&gt;/addons/internet/dom/DOMUserDefRef.dll"/>
            <Item Name="XML Close Reference(Node).vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/dom/dom.llb/XML Close Reference(Node).vi"/>
            <Item Name="XML Close Reference(Impl).vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/dom/dom.llb/XML Close Reference(Impl).vi"/>
            <Item Name="XML Close Reference(NdList).vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/dom/dom.llb/XML Close Reference(NdList).vi"/>
            <Item Name="XML Close Reference(NNMap).vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/dom/dom.llb/XML Close Reference(NNMap).vi"/>
            <Item Name="XML Close Reference.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/dom/dom.llb/XML Close Reference.vi"/>
            <Item Name="XML Get Node Text Content.vi" Type="VI" URL="/&lt;vilib&gt;/addons/internet/dom/dom.llb/XML Get Node Text Content.vi"/>
            <Item Name="Generate Temporary File Path.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/libraryn.llb/Generate Temporary File Path.vi"/>
            <Item Name="General Error Handler.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/General Error Handler.vi"/>
            <Item Name="General Error Handler CORE.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/General Error Handler CORE.vi"/>
            <Item Name="DialogTypeEnum.ctl" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/DialogTypeEnum.ctl"/>
            <Item Name="Check Special Tags.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Check Special Tags.vi"/>
            <Item Name="TagReturnType.ctl" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/TagReturnType.ctl"/>
            <Item Name="Set String Value.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Set String Value.vi"/>
            <Item Name="GetRTHostConnectedProp.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/GetRTHostConnectedProp.vi"/>
            <Item Name="Error Code Database.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Error Code Database.vi"/>
            <Item Name="Format Message String.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Format Message String.vi"/>
            <Item Name="Find Tag.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Find Tag.vi"/>
            <Item Name="Search and Replace Pattern.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Search and Replace Pattern.vi"/>
            <Item Name="Set Bold Text.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Set Bold Text.vi"/>
            <Item Name="Details Display Dialog.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Details Display Dialog.vi"/>
            <Item Name="ErrWarn.ctl" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/ErrWarn.ctl"/>
            <Item Name="Clear Errors.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Clear Errors.vi"/>
            <Item Name="eventvkey.ctl" Type="VI" URL="/&lt;vilib&gt;/event_ctls.llb/eventvkey.ctl"/>
            <Item Name="Not Found Dialog.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Not Found Dialog.vi"/>
            <Item Name="Three Button Dialog.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Three Button Dialog.vi"/>
            <Item Name="Three Button Dialog CORE.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Three Button Dialog CORE.vi"/>
            <Item Name="Longest Line Length in Pixels.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Longest Line Length in Pixels.vi"/>
            <Item Name="Convert property node font to graphics font.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Convert property node font to graphics font.vi"/>
            <Item Name="Get Text Rect.vi" Type="VI" URL="/&lt;vilib&gt;/picture/picture.llb/Get Text Rect.vi"/>
            <Item Name="BuildHelpPath.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/BuildHelpPath.vi"/>
            <Item Name="GetHelpDir.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/GetHelpDir.vi"/>
            <Item Name="DialogType.ctl" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/DialogType.ctl"/>
            <Item Name="propPagePersistenceType.ctl" Type="VI" URL="/&lt;vilib&gt;/express/express shared/propPagePersistenceType.ctl"/>
            <Item Name="ex_Read Properties.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_Read Properties.vi"/>
            <Item Name="propPageData.ctl" Type="VI" URL="/&lt;vilib&gt;/express/express shared/propPageData.ctl"/>
            <Item Name="ex_Get All Control Refnums.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_Get All Control Refnums.vi"/>
            <Item Name="subCalcPropPageCtlName.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/subCalcPropPageCtlName.vi"/>
            <Item Name="ex_Get CtrlRefs for PropPage.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_Get CtrlRefs for PropPage.vi"/>
            <Item Name="ex_GetAllConstantRefnums.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_GetAllConstantRefnums.vi"/>
            <Item Name="ex_Make Hidden Tag.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_Make Hidden Tag.vi"/>
            <Item Name="ex_Get Control Refnum.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_Get Control Refnum.vi"/>
            <Item Name="Simple Error Handler.vi" Type="VI" URL="/&lt;vilib&gt;/Utility/error.llb/Simple Error Handler.vi"/>
            <Item Name="Open Express VI Help.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/Open Express VI Help.vi"/>
            <Item Name="ex_PPGetProp.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_PPGetProp.vi"/>
            <Item Name="ex_PPGetValue.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_PPGetValue.vi"/>
            <Item Name="ex_PercentGFormat.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_PercentGFormat.vi"/>
            <Item Name="ex_Reconfigure.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_Reconfigure.vi"/>
            <Item Name="ex_Redrop Instance VI.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_Redrop Instance VI.vi"/>
            <Item Name="ex_Write Properties.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_Write Properties.vi"/>
            <Item Name="ex_Grow Inputs and Outputs.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_Grow Inputs and Outputs.vi"/>
         </Item>
         <Item Name="semaphor" Type="VI" URL="semaphor"/>
      </Item>
      <Item Name="Build Specifications" Type="Build"/>
   </Item>
</Project>
