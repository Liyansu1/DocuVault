import React, { useState, useEffect, useCallback } from 'react';
import { useMetaMaskContext } from '../context/MetaMaskContext';
import axios from 'axios';

import * as XLSX from 'xlsx';

import { v4 as uuid } from "uuid";


import MiniStatistics from '../components/card/MiniStatistics';
import IconBox from '../components/icons/IconBox';
import { Box, Button,  Flex, Icon,  SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { FaRegAddressBook } from "react-icons/fa";
import { Text } from '@chakra-ui/react';

import { FaBuilding } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { FaUniversity } from "react-icons/fa";

import { MdOutlineVerified } from "react-icons/md";


import {  MdCancel } from "react-icons/md";
import { TabelCard } from '../mainComponents/TabelCard';
import TransactionCard from '../mainComponents/TransactionCard';
import CompanyManage from '../mainComponents/CompanyManage';
import FileUpload from '../mainComponents/FileUpload';


import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { IoMdCloseCircle } from "react-icons/io";


import { ApiBaseUrl, ClientBaseUrl } from '../utils';




// Create a Web3 instance using the current Ethereum provider (MetaMask)
function UniversityPage() {
  const [file, setFile] = useState(null);
  // const [oldcid, setoldCid] = useState(null);
  // const [newcid, setnewCid] = useState(null);

  const [ipfsData, setIpfsData] = useState(null);  //response from IPFS server//

  const [Transaction, setTransaction] = useState(); //trnsaction detail//


  //  const [pdfUrl, setPdfUrl] = useState(null);

  const { contract, account } = useMetaMaskContext();

  const [companyAddresses, setCompanyAddresses] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(''); // State for selected company address

  const [universityDocumentlist, setUniversityDocumentlist] = useState([]); // State for selected company address
  const [selectedUUID, setSelectedUUID] = useState(''); // State for selected company address

  const [DocumentCompanylist, setDocumentCompanylist] = useState([]); // State for selected company address

  const [DocumentDetails, setDocumentDetails] = useState([]); // State for selected company address


  const [isUniversityVerified, setisUniversityVerified] = useState(null);


  //multiple file upload //
  const [excelFile, setExcelFile] = useState(null);
  const [uploadData, setUploadData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [userm, setUserm] = useState();


  ///colors//
  const cardbg = useColorModeValue('#ffffff', 'navy.800');
  const brandColor = useColorModeValue("brand", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const bg = useColorModeValue("gray.100", "navy.700");
  const borderColor = useColorModeValue("secondaryGray.100", "whiteAlpha.100");
  const uploadColor = useColorModeValue("brand.500", "white");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const iconColor = useColorModeValue("secondaryGray.500", "white");






  const onDrop = useCallback((acceptedFiles) => {  //sigle file upload for verification

    setFile(acceptedFiles[0]);

  }, []);



  const getHash = async () => { //hash for verify//
    setIpfsData(null);
    setTransaction(null);
    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('selectedUUID', selectedUUID); // Include the selectedUUID in the formData

    try {
      const oldresponse = await axios.post(`${ApiBaseUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });



      console.log("oldresponse", oldresponse.data);

      //  setoldCid(oldresponse.data.cid);
      const check = await checkStatusnVerify(oldresponse.data.cid);

      if (check) {


        try {
          const newresponse = await axios.post(`${ApiBaseUrl}/issue`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          console.log(newresponse.data);
          const data = newresponse.data;   //cid//ifpsLink//uuid

          setIpfsData(data);
          verifyDocument(oldresponse.data.cid, newresponse.data.cid);


        } catch (error) {
          console.error(error);
        }
      } else {
        console.error("Document is invalid");
      }

    } catch (error) {
      console.error(error);
    }
  };

  async function checkStatusnVerify(_cid) {
    try {



      const transaction = await contract.checknverify(selectedUUID, _cid, { from: account });

      console.log('Document is Verified:', transaction);
      return !transaction;
    } catch (error) {
      toast.error('Invalid Document', {
        icon: IoMdCloseCircle,
       
      });

      console.error('Error checking verification status:', error);
      // Handle the error here
      return false;
    }
  }



  const getHash2 = async () => { //hash for unverify//
    setIpfsData(null);
    setTransaction(null);
    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('selectedUUID', selectedUUID); // Include the selectedUUID in the formData

    try {
      const newresponse = await axios.post(`${ApiBaseUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });


      console.log(newresponse.data);


      unverifyDocument(newresponse.data.cid);

    } catch (error) {
      console.error(error);
    }


  };



  // Define your document upload function
  async function verifyDocument(_oldcid, _newcid) {
    try {

      // Call the smart contract function
      console.log("data:", selectedUUID, _oldcid, _newcid);
      const transaction = await contract.verifyDocument(selectedUUID, _oldcid, _newcid, { from: account });
      await transaction.wait();
      setTransaction(transaction);
      console.log('Document Verified successfully:', transaction);
      getUniversityDocumentList();

      toast.success(' Document verified Successfully', {
        icon: MdOutlineVerified,
       
      });

      callEMail(selectedUUID);

    } catch (error) {
      toast.error('Error verifying document', {
        icon: IoMdCloseCircle,
       
      });
      console.error('Error verifying document:', error);
      // Handle the error here
    }
  }
  async function unverifyDocument(_newcid) {
    try {

      // Call the smart contract function
      const transaction = await contract.unverifyDocument(selectedUUID, _newcid, { from: account });
      await transaction.wait();
      setTransaction(transaction);
      console.log('Document unVerified successfully:', transaction);
      getUniversityDocumentList();
      toast.success(' Document un-verified Successfully', {
        icon: MdOutlineVerified,
       
      });
    } catch (error) {
      toast.error('Error un-verifying document', {
        icon: IoMdCloseCircle,
       
      });
      console.error('Error unverifying document:', error.reason);
      // Handle the error here
    }
  }



  useEffect(() => {
    // Check if contract is not null
    if (contract !== null) {


      getUniversityDocumentList();
      fetchCompanyAddresses();
      checkUniversity();
      getUser();
    }
  }, [account]); // Add contract as a dependency

  const getUser = async () => {
    const userm = await fetchUser("university", account.toLowerCase());
    setUserm(userm);
  }

  // Function to handle dropdown selection
  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };
  const handleDocumentChange = (event) => {
    setSelectedUUID(event.target.value);

    getDocumentCompanyList(event.target.value);
  };

  // Function to fetch company addresses from the smart contract
  const fetchCompanyAddresses = async () => {
    try {
      const transaction = await contract.getAllCompanyAddresses({ from: account });
      console.log('fetch company addresses:', transaction); // Log the response
      const uniqueAddressesSet = new Set(transaction);
      // Convert the Set back to an array.
      const uniqueAddressesArray = [...uniqueAddressesSet];
      setCompanyAddresses(uniqueAddressesArray);
    } catch (error) {
      console.error('Error fetching Company addresses:', error.reason);
    }
  };

  async function includeCompany() {
    try {
      setIpfsData(null);
      setTransaction(null);
      // Call the smart contract function
      const transaction = await contract.includeCompany(selectedUUID, selectedCompany, { from: account });
      await transaction.wait();
      setTransaction(transaction);

      getDocumentCompanyList(selectedUUID);
      console.log('Company included successfully:', transaction);
      toast.success('Company included Successfully', {
        icon: FaBuilding,
       
      });

    } catch (error) {
      console.error('Error including company:', error.reason);
      toast.error('Error including company', {
        icon: IoMdCloseCircle,
       
      });

      // Handle the error here
    }
  }
  async function removeCompany() {
    try {
      setIpfsData(null);

      setTransaction(null);
      // Call the smart contract function
      const transaction = await contract.removeCompany(selectedUUID, selectedCompany, { from: account });
      await transaction.wait();
      setTransaction(transaction);

      getDocumentCompanyList(selectedUUID);
      console.log('Company removed successfully:', transaction.transactionHash);
      toast.success('Company removed Successfully', {
        icon: FaBuilding,
       
      });

    } catch (error) {
      console.error('Error removing company:', error.reason);
      toast.error('Error removing company', {
        icon: IoMdCloseCircle,
       
      });
      // Handle the error here
    }
  }




  async function addUniversityfn() {
    try {
      setIpfsData(null);

      setTransaction(null);
      setSelectedUUID('');
      // Call the 'addUniversity' function with the provided university address
      const transaction = await contract.addUniversity({ from: account });

      // Wait for the transaction to be mined and get the transaction hash
      await transaction.wait();
      setTransaction(transaction);
      console.log('University registered successfully:', transaction);
      toast.success('University registered successfully', {
        icon: FaUniversity,
       
      });

    } catch (error) {
      console.error('Error UniversityAdded:', error.reason);
      toast.error('Error registering university', {
        icon: IoMdCloseCircle,
       
      });
      // Handle the error here
    }
  }

  async function checkUniversity() {
    try {

      // Call the smart contract function
      const transaction = await contract.checkUniversity(account, { from: account });

      console.log('university status:', transaction);
      setisUniversityVerified(transaction);

    } catch (error) {
      console.error('Error checking university:', error.reason);
      // Handle the error here
    }
  }

  const getUniversityDocumentList = async () => {
    try {
      const transaction = await contract.getUniversityDocumentList({ from: account });
      console.log('Response getUniversityDocumentList:', transaction); // Log the response

      setUniversityDocumentlist(transaction);
    } catch (error) {
      console.error('Error fetching documents:', error.reason);
    }
  };

  async function viewDocument() {
    window.location.href = `/CompanyPage?document=${selectedUUID}`;
  }


  const getDocumentCompanyList = async (uuid) => {
    try {
      if (!uuid) {
        setDocumentCompanylist([]);
        return;
      };
      const transaction = await contract.getDocumentCompanyList(uuid, { from: account });
      console.log('Response getDocumentCompanyList:', transaction); // Log the response

      setDocumentCompanylist(transaction);
    } catch (error) {
      console.error('Error fetching DocumentCompanyList:', error.reason);
    }
  };

  useEffect(() => {
    setDocumentDetails([]);
    const fetchData = async () => {
      const collectedData = [];
      for (const uuid of universityDocumentlist) {
        const data = await getDocumentDetails(uuid);
        collectedData.push(data);
      }
      setDocumentDetails(collectedData);
    };

    fetchData();
  }, [universityDocumentlist]);


  const getDocumentDetails = async (uuid) => {
    try {
      if (!uuid) {

        return;
      };
      const transaction = await contract.getDocumentDetails(uuid, { from: account });
      const arr = [].concat(...transaction);
      arr.push(uuid);
      arr.splice(3, 1);
      [arr[0], arr[1], arr[2], arr[3]] = [arr[3], arr[2], arr[0], arr[1]];

      console.log('Response getDocumentDetails:', arr);
      return arr;
    } catch (error) {
      console.error('Error fetching DocumentCompanyList:', error.reason);
    }
  };



  //multiple file uplaod//

  const handleExcelFileChange = useCallback((event) => {
    setSelectedFiles([]);
    const file = event[0];
    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
      const worksheet = workbook.Sheets[sheetName];

      const excelData = XLSX.utils.sheet_to_json(worksheet);
      setUploadData(excelData);
      console.log("data: ", excelData);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFilesChange = useCallback((event) => {
    const files = event;
    setSelectedFiles([...selectedFiles, ...files]);
  }, []);

  const handlemultipleUpload = async () => {

    setTransaction(null);
    setIpfsData(null);
    setSelectedUUID('');
    if (!excelFile) {
      console.error('Please select an Excel file');
      return;
    }

    if (uploadData.length === 0) {
      console.error('No data found in the Excel file');
      return;
    }

    try {
      const uploadDataWithResponses = [];
      const studentAddressList = [];
      for (const data of uploadData) {
        const file = selectedFiles.find((file) => file.name === data.fileName); // Find file by name

        if (file) {
          const formData = new FormData();
          const id = uuid();
          formData.append('certificate', file);
          formData.append('selectedUUID', id); // Include the selectedUUID in the formData

          const response = await axios.post(`${ApiBaseUrl}/issue`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          uploadDataWithResponses.push([id, response.data.cid]);
          studentAddressList.push(data.studentAddress);
          console.log("Uploaded for", id, data.studentAddress, response.data);
        } else {
          console.error(`File: ${data.fileName} not found for student: ${data.studentAddress}`);
          toast.error(`File: ${data.fileName} not found for student: ${data.studentAddress}`, {
            icon: IoMdCloseCircle,
          });
        }

      }
      if (uploadDataWithResponses.length > 0 && studentAddressList.length > 0)
        uploadDocumentnVerify(uploadDataWithResponses, studentAddressList, uploadDataWithResponses.length);
    } catch (error) {
      console.error('Error occurred during upload:', error);
    }
  };
  async function uploadDocumentnVerify(data, studentAddressList, count) {
    try {
      console.log("data:", data, "studentaddress:", studentAddressList, " count: ", count);
      const transaction = await contract.uploadDocumentnVerify(data, studentAddressList, count, { from: account });
      await transaction.wait();
      setTransaction(transaction);
      console.log('Document upload n Verifying successfully:', transaction);

      getUniversityDocumentList();
      toast.success(' Document verified Successfully', {
        icon: MdOutlineVerified,
       
      });
    } catch (error) {
      toast.error('Error uploading & verifying ', {
        icon: IoMdCloseCircle,
       
      });
      console.error('Error upload n verifying document:', error);
      // Handle the error here
    }
  }


  const fetchUser = async (role, address) => {
    try {
      const userdata = { role: role, address: address };
      const response = await axios.post(`${ApiBaseUrl}/auth/getdata`, userdata);
      console.log("users", response.data);
      if (response.status === 200) {
        return (response.data.user);
      }

    } catch (error) {
      console.error('Error fetching users:', error);
      return "error";
    }
  };

  const sendEMail = async (receiver, subject, body) => {
    try {
      const userdata = { receiver: receiver, subject: subject, body: body };
      const response = await axios.post(`${ApiBaseUrl}/auth/sendEmail`, userdata);
      console.log("users", response.data);
      if (response.status === 200) {
        return (response.data.message);
      }

    } catch (error) {
      console.error('Error sendind mail:', error);
      return "error";
    }
  };

  const callEMail = async (doqid) => {
    const data = await getDocumentDetails(doqid);
    const user = await fetchUser("student", data[1].toLowerCase());
    if (user == "error") return;
    const subject = "Document verification request"
    const body = `
  <html>
    <body>
      <p>Dear ${user.name},</p>
      <p>I trust this email finds you well. we are from Doqfy, and we are writing to you on behalf of ${userm.name}, a registered user on our Doqfy platform.</p>
      <p>${userm.name} has approve your request for document verification</p>
      <p>Below are the details of the verification request:</p>
      <ul>
       <li><strong>Doqument Id:</strong> ${selectedUUID}</li>
        <li><strong>Student Name:</strong> ${user.name}</li>
        <li><strong>Student Roll No:</strong> ${user.roleid}</li>
        
        <li><strong>Student Address:</strong> ${user.address}</li>
        
        <li><strong>University Name:</strong> ${userm.name}</li>
        <li><strong>University Address:</strong> ${userm.address}</li>
        
        <li><strong>Document Type:</strong> Degree or Certificate</li>
      </ul>
      <p>Please Login with your Student Account on Doqfy and check verification status for your requested document and you can also share your verified document using QR code embedded on your it.</p>
       <p>We appreciate your attention to this matter and look forward to a smooth verification process.</br>
       Thank you for using our service</p>
      <p>Best regards,<br>Doqfy<br><a href="${ClientBaseUrl}">${ClientBaseUrl}</a></p>
    </body>
  </html>
`;

    const res = await sendEMail(user.email, subject, body);
    if (res != "error") {
      toast.success('Email send Successfully', {
        icon: HiOutlineMail,
      });
    } else {
      toast.error('Error sending Email', {
        icon: IoMdCloseCircle,
      });
    }
  }


  return (

    <Box>
      
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 2, "2xl": 6 }}
          gap='20px'
          mb='20px'>
        {userm &&  <Flex
            borderRadius="20px"
            p='4'
            bg={cardbg}
            backgroundClip="border-box"

            alignItems='center' >
            <IconBox
              w='40px'
              h='40px'
              bg={boxBg}
              icon={
                <Icon w='20px' h='20px' as={FaUniversity} color={uploadColor} />
              }
            />
            <Text
              color={textColor}
              fontSize='22px'
              fontWeight='500'
              lineHeight='100%'
              alignSelf='center'
              ml='4'
            >
              {userm.name}
            </Text>

          </Flex> }
          <Flex
            borderRadius="20px"
            p='4'
            bg={cardbg}
            backgroundClip="border-box"

            alignItems='center' >
            <IconBox ml='2'
              w='40px'
              h='40px'
              bg={boxBg}
              icon={<Icon
                w='20px'
                h='20px'
                as={isUniversityVerified ? MdOutlineVerified : MdCancel}
                color={isUniversityVerified ? uploadColor : 'red'}
              />}
            />
            <Text
              color={textColor}
              fontSize='22px'
              fontWeight='500'
              lineHeight='100%'
              alignSelf='center'
              ml='4'
            >
              {isUniversityVerified ? "University verified":"University not verified"}
            </Text>
           
            {!isUniversityVerified &&
              <Button
                ml='auto'
                onClick={addUniversityfn}
                w='140px'
                mt={{ base: "0px", "2xl": "auto" }}
                variant='brand'
                fontWeight='500'>
                Register
              </Button>}

          </Flex>

        </SimpleGrid>
      
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 2, "2xl": 6 }}
        gap='20px'
        mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox
              w='40px'
              h='40px'
              bg={boxBg}
              icon={
                <Icon w='20px' h='20px' as={FaRegAddressBook} color={uploadColor} />
              }
            />
          }
          name='Account'
          value={account}
        />
        {userm &&
          <MiniStatistics
            startContent={
              <IconBox
                w='40px'
                h='40px'
                bg={boxBg}
                icon={
                  <Icon w='20px' h='20px' as={HiOutlineMail} color={uploadColor} />
                }
              />
            }
            name='Email'
            value={userm.email}
          />
        }

      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>

        {/* FileUpload component */}
        <FileUpload
          onDrop={onDrop}
          file={file}
          heading={"Verify Document"}
          selectLabel={"Select Document"}
          handleSelectChange={handleDocumentChange}
          selectedValue={selectedUUID}
          selectList={universityDocumentlist}
          handleBtn1={getHash}
          btn1Text={"Verify"}
          handleBtn2={getHash2}
          btn2Text={"Un-Verify"}

        />



        <TransactionCard uuid={selectedUUID} Transaction={Transaction} ipfsData={ipfsData} />

      </SimpleGrid>

      {/*multiple FileUpload component */}
      <SimpleGrid

       columns={{ base: 1, md: 2, xl: 2 }} 

        borderRadius="20px"
        mb='20px'
        bg={cardbg}
        backgroundClip="border-box"
        gap={{base:'0px',md:"20px"}}
      >

        <FileUpload
          onDrop={handleExcelFileChange}
          file={excelFile}
          heading={"Multiple Document Upload & Verify"}
          handleBtn1={handlemultipleUpload}
          btn1Text={"Upload & Verify"}

          uploadLabel='Only Excel File allowed'
          width={"100%"}
        />
        <FileUpload
          onDrop={handleFilesChange} file={selectedFiles}
          width={"100%"}
        />
      </SimpleGrid>


      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
        {/* add or remove company */}
        <CompanyManage
          handleDocumentChange={handleDocumentChange}
          uuid={selectedUUID}
          Documentlist={universityDocumentlist}

          handleCompanyChange={handleCompanyChange}
          selectedCompany={selectedCompany}
          companyAddresses={companyAddresses}
          includeCompany={includeCompany}
          removeCompany={removeCompany}
        />



        {/* Document Companies List */}
        <TabelCard data={[DocumentCompanylist]} headers={["S.N", "Companies"]}
          heading={"Document Companies List"} searchId={0} searchLabel={"Search Company"} />

      </SimpleGrid>





      <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap='20px' mb='20px' >
        {/* Company Document List */}

        <TabelCard data={DocumentDetails} headers={["S.N", "Document", "Student", "IPFS CID", "Verified"]}
          heading={"University Document List"} searchId={1} searchLabel={"Search Document"}
        />


      </SimpleGrid>








    </Box>
  );
}

export default UniversityPage;
