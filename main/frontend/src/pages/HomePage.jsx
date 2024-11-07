import { Suspense, useState } from "react";
import React, {  useEffect } from 'react';
import { Canvas } from '@react-three/fiber'
import {  RandomizedLight, Center, Environment, OrbitControls } from '@react-three/drei'
import { Text, Box, Button, Flex,  Stack, useColorModeValue, useColorMode, Tr, Tbody, Table, Th, Td, Thead, TableContainer } from '@chakra-ui/react';

import { PiStudentFill } from "react-icons/pi";
import { FaUniversity } from "react-icons/fa";
import { FaBuilding } from "react-icons/fa";
import RoleInfoBox from "../mainComponents/RoleInfoBox";
import ThreeDModelCanvas from "../mainComponents/ThreedModel/ThreeDModelCanvas";
import UniversalModel from "../mainComponents/ThreedModel/UniversalModel";
import FlowChart from "../mainComponents/Flowchart/FlowChart";


import { Html, useProgress } from '@react-three/drei'



import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { MdFileCopy, } from "react-icons/md";
import axios from 'axios';


import { gsap } from "gsap-trial";
    
import { SlowMo } from "gsap-trial/EasePack";

/* The following plugin is a Club GSAP perk */
import { SplitText } from "gsap-trial/SplitText";

import { ApiBaseUrl } from '../utils';


function Loader() {
  const { progress } = useProgress()
  return <Html center>{progress.toFixed(2)} % loaded</Html>
}

export default function HomePage() {

  gsap.registerPlugin(SplitText,SlowMo);


  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;

    // Check if the user agent indicates a mobile or tablet device
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    setIsMobile(isMobileDevice);
      
    animateText("title");
    //animateText2("about");

  }, []);

  const animateText = (id)=>{
    const tl = gsap.timeline(),
  mySplitText = new SplitText(`#${id}`, { type: "words,chars" }),
  chars = mySplitText.chars; //an array of all the divs that wrap each character

gsap.set(`#${id}`, { perspective: 400 });


tl.from(chars, {
  duration:2,
  opacity: 0,
  scale: 2,
  y: 80,
  rotationX: 180,
  transformOrigin: "0% 50% -50",
  ease: "back",
  stagger: 0.15
});

  }

  const animateText2=(id)=>{
    const t2 = gsap.timeline(),
    mySplitText2 = new SplitText(`#${id}`, { type: "words,chars" }),
    chars2 = mySplitText2.chars; //an array of all the divs that wrap each character
    gsap.set(`#${id}`, { perspective: 400 });

    t2.from(mySplitText2.chars, {duration: 2, scale:4, autoAlpha:0,  rotationX:-180,  transformOrigin:"100% 50%", ease:"back", stagger: 0.15});
  
  }

  //preset: ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'],
  const { colorMode } = useColorMode();
  const preset = colorMode === 'dark' ? 'night' : 'dawn';

  const cardbg = useColorModeValue('#ffffff', 'navy.800');
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const uploadColor = useColorModeValue("brand.500", "white");
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const [play, setplay] = useState(false);

  const studentPoints = [
    "Easy document submission and verification.",
    "Quick processing with minimal waiting time.",
    "Secure verification using blockchain.",
    "Controlled access to specific documents.",
    "Generate QR codes for easy sharing.",
    "Verify documents remotely, no need to travel.",
    "Receive verified documents securely via email.",
    "Cost savings by avoiding travel expenses.",
    "Digital storage and retrieval of verified documents.",
  ];

  const universityPoints = [
    "Verify student documents efficiently.",
    "Time-saving verification process.",
    "Enhanced security through blockchain.",
    "Bulk upload and verification using Excel files.",
    "Manage company access to documents (add/remove).",
    "Apply verified QR codes after successful verification.",
    "Share verified documents via email.",
    "Environmentally friendly – saves paper.",
    "Cost-effective for universities.",
  ];

  const companyPoints = [
    "Easily verify document authenticity using QR code or unique ID.",
    "Check real-time verification status of submitted documents.",
    "Efficiently identify and prevent counterfeit documents.",
    "Streamlined verification process for multiple universities and students.",
    "Saves time in the verification of documents from various sources.",
    "Enhances security and trust in the verification process.",
    "User-friendly interface for convenient document checking.",
    "Provides a reliable and centralized platform for efficient document verification.",
    "Reducing the chances of errors or fraud.",
  ];



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


  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${ApiBaseUrl}/auth/users`);
        if (response.status === 200) {
        setUsers(response.data.users);
      }
        console.log("users",response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array ensures the effect runs only once on mount


  return (

    <Box>
      <Flex mb="20px" justifyContent={"space-between"} bg={cardbg} backgroundClip="border-box" p='7' borderRadius={"20px"}>
        <Box p="3">
          <Text

            color={textColor}
            fontSize='42px'
            fontWeight='500'
            lineHeight='100%'
            id="title"
          >
            DocuVault
          </Text>
        
          <Text mt="8" mr="10"
            color={textColor}
            fontSize='16px'
            fontWeight='400'

          >

Welcome to DocuVault, where document verification is redefined through advanced Blockchain and IPFS integration. <br /> Our platform delivers top-notch security and integrity for your digital documents, capitalizing on blockchain’s immutable structure and IPFS’s decentralized storage features.
            
          </Text>
        </Box>
        {!isMobile &&
          <Box  >
            <Canvas style={{ borderRadius: "20px", height: "300px", width: "300px" }} shadows camera={{ position: [0, 0, 4.5], fov: 50 }}>
              <pointLight position={[10, 10, 10]} />
              <Suspense fallback={<Loader />}>
                <group position={[0, 0, 0]}>
                  <UniversalModel
                    modelname="ethereum"
                    position={{ x: 0, y: 0, z: 0 }}
                    rotation={{ x: 0, y: Math.PI / 2, z: 0 }}
                    scale={0.002}
                  />
                  <Center>
                    <UniversalModel
                      modelname="cube"
                      position={{ x: 0, y: 0, z: 0 }}
                      rotation={{ x: Math.PI / 4, y: 0, z: 0 }}
                      scale={0.09}
                    />
                  </Center>
                  <RandomizedLight amount={8} radius={5} ambient={0.5} position={[5, 3, 2]} bias={0.001} />
                </group>
                <Environment preset={preset} background blur={0.5} />
                <OrbitControls autoRotate autoRotateSpeed={4} enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.1} maxPolarAngle={Math.PI / 2.1} />
              </Suspense>
            </Canvas>
          </Box>
        }

      </Flex>


      {/*<Flex mb="20px" bg={cardbg} backgroundClip="border-box" p='7' borderRadius={"20px"}>
        {!isMobile &&
          <ThreeDModelCanvas modelname="student" scale={0.4} pos={[0, -2, 0]} />
        }
        <RoleInfoBox pl={isMobile?"3":"10"} icon={PiStudentFill} title="Student" points={studentPoints}  />
      </Flex>*/}

      {/*<Flex mb="20px" justifyContent={"space-between"} bg={cardbg} backgroundClip="border-box" p='7' borderRadius={"20px"}>
        <RoleInfoBox pl="3" icon={FaUniversity} title="University" points={universityPoints} />
        {!isMobile &&
          <ThreeDModelCanvas modelname="university" rotation={{ x: 0, y: Math.PI / 4, z: 0 }} scale={1.5} />
        }
      </Flex>*/}

       {/*<Flex mb="20px" bg={cardbg} backgroundClip="border-box" p='7' borderRadius={"20px"}>
        {!isMobile &&
          <ThreeDModelCanvas modelname="company" scale={0.008} />
        }
        <RoleInfoBox pl={isMobile?"3":"10"} icon={FaBuilding} title="Company" points={companyPoints} />
      </Flex>*/}

      {!isMobile &&
        <>
          <Box h="470" mb="20px" bg={cardbg} backgroundClip="border-box" p='7' borderRadius={"20px"}>
            <Text
              color={textColor}
              fontSize='22px'
              fontWeight='500'
              lineHeight='100%'>
              {"Working FlowChart"}
            </Text>
            <FlowChart />

          </Box>
          {/*<Box mb="20px" bg={cardbg} backgroundClip="border-box" p='2' borderRadius={"20px"}>
            <Flex gap="3" alignItems={"center"}>
              <Text m="3"
                color={textColor}
                fontSize='22px'
                fontWeight='500'
                lineHeight='100%'
                alignSelf='center'
              >
                {"Live Demo"}
              </Text>
              <Button m="3" size="sm" variant="outline" onClick={() => setplay(!play)}>{play ? "Pause" : "Play"}</Button>
            </Flex>
          

          </Box>*/}
        </>
      }

      <Stack borderRadius="20px"
        p='7'
        bg={cardbg}
        backgroundClip="border-box"
        spacing='5'
      mb="20px"
      >
        <Text
          mb='5'
          color={textColor}
          fontSize='22px'
          fontWeight='500'
          lineHeight='100%'>
          Universities List
        </Text>
        <Box borderWidth='1px' borderRadius='lg'>
        <TableContainer>
          <Table  size="md" >
            <Thead>
              <Tr>
                <Th >S.N</Th>
                <Th >University:</Th>
                <Th >Address:</Th>

              </Tr>
            </Thead>
            <Tbody>
            {users
          .filter((user) => user.role === 'university')
          .map((user, index) => (
            <Tr key={index}>
              <Td>{index + 1}</Td>
              <Td>{user.name}</Td>
              <Td onClick={() => handleCopyToClipboard(user.address)}>{user.address}</Td>
            </Tr>
          ))}
            </Tbody>
          </Table>
          </TableContainer>

        </Box>
      </Stack>
      <Stack borderRadius="20px"
        p='7'
        bg={cardbg}
        backgroundClip="border-box"
        spacing='5'
        mb="20px"
      >
        <Text
          mb='5'
          color={textColor}
          fontSize='22px'
          fontWeight='500'
          lineHeight='100%'>
          Companies List
        </Text>
        <Box borderWidth='1px' borderRadius='lg'>
        <TableContainer>
          <Table   size="md" >
            <Thead>
              <Tr>
                <Th >S.N</Th>
                <Th >Companies:</Th>
                <Th >Address:</Th>

              </Tr>
            </Thead>
            <Tbody>
            {users
          .filter((user) => user.role === 'company')
          .map((user, index) => (
            <Tr key={index}>
              <Td>{index + 1}</Td>
              <Td>{user.name}</Td>
              <Td onClick={() => handleCopyToClipboard(user.address)}>{user.address}</Td>
            </Tr>
          ))}
            </Tbody>
          </Table>
          </TableContainer>

        </Box>
      </Stack>
    </Box>

  )
}

