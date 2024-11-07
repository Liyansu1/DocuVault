import React, { useState, useEffect,  useCallback } from 'react';
import { useMetaMaskContext } from '../context/MetaMaskContext';
import axios from 'axios';
import { useLocation } from 'react-router-dom';


import MiniStatistics from '../components/card/MiniStatistics';
import IconBox from '../components/icons/IconBox';
import { Text, Box, Button, Flex, Icon, SimpleGrid, Stack, useColorModeValue } from '@chakra-ui/react';
import { FaRegAddressBook } from "react-icons/fa";

import { HiOutlineMail } from "react-icons/hi";
import { MdOutlineVerified } from "react-icons/md";

import {
  Table,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react'


import {

  MdFileCopy,
} from "react-icons/md";


import { FaBuilding } from "react-icons/fa";

import { MdCancel } from "react-icons/md";
import FileUpload from '../mainComponents/FileUpload';


import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { IoMdCloseCircle } from "react-icons/io";

import { ApiBaseUrl, IpfsBaseUrl } from '../utils';

// Create a Web3 instance using the current Ethereum provider (MetaMask)
function CompanyPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');   //check n verify status//
  const [QrCodeText, setQrCodeText] = useState('');  //input box and path qr txt//

  const { contract, account } = useMetaMaskContext();

  const location = useLocation();

  const [isCompanyVerified, setIsCompanyVerified] = useState(true);


  const [DocumentDetails, setDocumentDetails] = useState(null); //check status//
  const [userm, setUserm] = useState();



  const cardbg = useColorModeValue('#ffffff', 'navy.800');
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const uploadColor = useColorModeValue("brand.500", "white");
  const textColor = useColorModeValue("secondaryGray.900", "white");


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const documentValue = searchParams.get('document');

    if (documentValue) {
      setQrCodeText(documentValue);
    }
  }, [location.search]);


  const handleFileChange = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);

  }, []);



  const getHash = async () => {
    setStatus('');
    setDocumentDetails(null);

    const formData = new FormData();
    formData.append('certificate', file);

    try {
      if (!QrCodeText) return;
      const response = await axios.post(`${ApiBaseUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // console.log(response.data);   //uuid//cid
      console.log("uuid", QrCodeText, "hash", response.data.cid);

      checkStatusnVerify(response.data.cid);

    } catch (error) {
      console.error(error);
    }


  };

  async function checkStatusnVerify(_cid) {

    try {


      // Call the smart contract function
      console.log("uuid", QrCodeText, "hash", _cid);

      const transaction = await contract.checknverify(QrCodeText, _cid, { from: account });
      setStatus(`Document is Valid${transaction ? ' & Verified' : ' but Not Verified'}`);
      console.log('Document is Verified:', transaction);

      if (transaction) checkStatus();


      toast.success(`Document is Valid${transaction ? ' & Verified' : ' but Not Verified'}`, {
        icon: MdFileCopy,

      });

    } catch (error) {
      setStatus("Document is Invalid or Fake");
      console.error('Error checking verification status:', error.reason);
      toast.error('Document is Invalid or Fake', {
        icon: IoMdCloseCircle,

      });
      // Handle the error here
    }
  }


  // Define your document upload function
  async function checkStatus() {
    try {
      setDocumentDetails(null);
      if (!QrCodeText) {

        return;
      };
      // Call the smart contract function
      const transaction = await contract.getDocumentDetails(QrCodeText, { from: account });
      const arr = [].concat(...transaction);
      arr.push(QrCodeText);
      //ipfs//verify//student//university//doc//
      [arr[0], arr[1], arr[2], arr[3], arr[4]] = [arr[4], arr[2], arr[3], arr[0], arr[1]];

      setDocumentDetails(arr);

      console.log('Document details:', arr);


    } catch (error) {
      console.error('Error checking document details:', error.reason);
      toast.error('Error checking document details', {
        icon: IoMdCloseCircle,

      });
      // Handle the error here
    }
  }

  // Define your document upload function
  async function addCompanyfn() {
    try {

      // Call the smart contract function
      const transaction = await contract.registerCompany({ from: account });
      await transaction.wait();
      console.log('Company registered successfully:', transaction);

      toast.success(`Company registered successfully`, {
        icon: FaBuilding,

      });


    } catch (error) {
      console.error('Error registring company:', error.reason);
      toast.error('Error registring company', {
        icon: IoMdCloseCircle,

      });
      // Handle the error here
    }
  }


  async function checkCompany() {
    try {

      // Call the smart contract function
      const transaction = await contract.checkCompany(account, { from: account });
      setIsCompanyVerified(transaction);

      console.log('Company status:', transaction);


    } catch (error) {
      console.error('Error checking company:', error.reason);
      // Handle the error here
    }
  }

  const handleChange = (event) => {
    setQrCodeText(event.target.value);
  };

  useEffect(() => {
    // Check if contract is not null
    if (contract !== null) {
      checkCompany();
      getUser();
    }
  }, [account]);

  const getUser = async () => {
    const userm = await fetchUser("company", account.toLowerCase());
    setUserm(userm);
  }



  const cellStyle = {
    wordBreak: 'break-all',
    padding: '5px',
    cursor: 'pointer', // Adding a pointer cursor to indicate clickable content

  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Notify the user or handle success if needed
        // console.log('Text copied to clipboard:', text);
        toast.success('Text copied to clipboard', {
          icon: MdFileCopy,

        });
      })
      .catch((error) => {
        // Handle error if clipboard write fails
        console.error('Failed to copy text to clipboard:', error);
      });
  };

  
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

  return (

    <Box>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 2, "2xl": 6 }}
        gap='20px'
        mb='20px'>
        {userm && <Flex
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
              <Icon w='20px' h='20px' as={FaBuilding} color={uploadColor} />
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

        </Flex>}

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
              as={isCompanyVerified ? MdOutlineVerified : MdCancel}
              color={isCompanyVerified ? uploadColor : 'red'}
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
            {"Company Status"}
          </Text>

          {!isCompanyVerified &&
            <Button
              ml='auto'
              onClick={addCompanyfn}
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
          onDrop={handleFileChange}
          file={file}
          heading={"Check & Verify Document"}
          handleBtn1={getHash}
          btn1Text={"Check & Verify"}
          handleBtn2={checkStatus}
          btn2Text={"checkStatus"}

          inputText={"Document Id"}

          inputValue={QrCodeText}
          handleInputChange={handleChange}

        />
        {status || DocumentDetails ?
          <Stack borderRadius="20px"
            p='7'
            bg={cardbg}
            backgroundClip="border-box"
            spacing='5'

          >
            <Text
              mb='5'
              color={textColor}
              fontSize='22px'
              fontWeight='500'
              lineHeight='100%'>
              Document Status
            </Text>
            {status &&
              <Text
                color={textColor}
                fontSize='18px'
                fontWeight='500'
                textAlign='center'
              >
                {status}
              </Text>
            }
            {DocumentDetails && <>
              <Box height='auto' borderWidth='1px' borderRadius='lg'>

                <Table >
                  <Tbody>
                    <Tr>
                      <Th >Document:</Th>
                      <Td style={cellStyle} onClick={() => handleCopyToClipboard(DocumentDetails[0])}>{DocumentDetails[0]}</Td>
                    </Tr>
                    <Tr>
                      <Th >Student:</Th>
                      <Td style={cellStyle} onClick={() => handleCopyToClipboard(DocumentDetails[1])}>{DocumentDetails[1]}</Td>
                    </Tr>
                    <Tr>
                      <Th >University:</Th>
                      <Td style={cellStyle} onClick={() => handleCopyToClipboard(DocumentDetails[2])}>{DocumentDetails[2]}</Td>
                    </Tr>
                    <Tr>
                      <Th >Ipfs Cid:</Th>
                      <Td style={cellStyle} onClick={() => handleCopyToClipboard(DocumentDetails[3])}>{DocumentDetails[3]}</Td>
                    </Tr>
                    <Tr>
                      <Th >Ipfs Link:</Th>
                      <Td style={cellStyle} color='blue'>
                        <a href={`${IpfsBaseUrl}/ipfs/${DocumentDetails[3]}`} target='_blank'>
                          {`${IpfsBaseUrl}/ipfs/${DocumentDetails[3]}`}
                        </a>
                      </Td>
                    </Tr>
                    <Tr>
                      <Th >Verified:</Th>
                      <Td style={cellStyle}>
                        {DocumentDetails[4] === 'true' ? (
                          <Icon w='20px'
                            h='20px' as={MdOutlineVerified} color='green' />
                        ) : (
                          <Icon w='20px'
                            h='20px' as={MdCancel} color='red' />
                        )}
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            </>
            }
          </Stack>
          : null}

      </SimpleGrid>








    </Box>
  );
}

export default CompanyPage;
