// Chakra Imports
import {
	Avatar,
	Box,
	Button,
	Flex,
	Icon,
	IconButton,
	Image,
	Link,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
	useColorModeValue,
	useDisclosure
} from '@chakra-ui/react';
// Custom Components
//import { SearchBar } from 'components/navbar/searchBar/SearchBar';
//import { SidebarResponsive } from 'components/sidebar/Sidebar';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
// Assets
//import navImage from 'assets/img/layout/Navbar.png';
import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';
import { FaEthereum } from 'react-icons/fa';
import { ThemeEditor } from '../ThemeEditor';
import { SidebarResponsive } from '../sidebar/Sidebar';
import routes from '../../routes.jsx';
import { usePageContext } from '../../context/PageContext.jsx';
import { useUserContext } from '../../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import FixedPlugin from '../FixedPlugin.jsx';
import { ItemContent } from '../menu/ItemContent.jsx';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

import { useNotificationCenter } from "react-toastify/addons/use-notification-center";
import { IoMdLogOut } from "react-icons/io";
import { RiChatDeleteFill } from "react-icons/ri";
import { useMetaMaskContext } from '../../context/MetaMaskContext.jsx';
import { ethers } from 'ethers';
//import routes from 'routes.js';
import {
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
} from '@chakra-ui/react'
import { Howl, Howler } from 'howler';
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { HiMiniSpeakerXMark } from "react-icons/hi2";

export default function HeaderLinks(props) {
	const { secondary } = props;
	// Chakra Color Mode
	const navbarIcon = useColorModeValue('gray.400', 'white');
	let menuBg = useColorModeValue('white', 'navy.800');
	const textColor = useColorModeValue('secondaryGray.900', 'white');
	const textColorBrand = useColorModeValue('brand.700', 'white');
	const ethColor = useColorModeValue('gray.700', 'white');
	const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
	const ethBg = useColorModeValue('secondaryGray.300', 'navy.900');
	const ethBox = useColorModeValue('white', 'navy.800');
	const shadow = useColorModeValue(
		'14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
		'14px 17px 40px 4px rgba(112, 144, 176, 0.06)'
	);
	const borderButton = useColorModeValue('secondaryGray.500', 'whiteAlpha.200');
	const profileColor = useColorModeValue('brand.500', 'brand.400');
	const profileText = 'white';
	const { role, name, path } = usePageContext(); // Access the role from the context
	const { users, logout } = useUserContext();
	const { onOpen, isOpen } = useDisclosure();
	const { provider, account } = useMetaMaskContext();

	const [sliderValue, setSliderValue] = React.useState(30)

	const [balance, setBalance] = useState(''); // State to hold the balance
	useEffect(() => {
		const getBalance = async () => {
			try {

				const weiBalance = await provider.getBalance(account);
				const etherBalance = ethers.utils.formatEther(weiBalance);
				const roundedValue = Number(etherBalance).toFixed(2);

				setBalance(roundedValue);
			} catch (error) {
				console.error('Error fetching balance:', error.message);
			}
		};
		getBalance();
	}, [account, provider])



	const { notifications, clear, markAllAsRead, markAsRead } =
		useNotificationCenter();

	const isLoggedIn = (role) => {
		const currentUser = users.find(user => user.role === role);
		return currentUser ? currentUser.isLoggedIn : false;
	};

	const navigate = useNavigate();

	const handleLogout = () => {
		toast.info(`Logout Successfully`, {
			icon: IoMdLogOut,
			
		});
		localStorage.removeItem(role);
		logout(role);

	};

	const soundRef = useRef(null);

	const playbg = async () => {
		// Create a new Howl instance only if it doesn't exist
		if (!soundRef.current) {
			soundRef.current = new Howl({
				src: ['./music/bg.m4a'],
				html5: true,
				loop: true,
			});
		}

		// Start playing the sound
		soundRef.current.play();

		// Cleanup function to stop playing the sound when the component unmounts
		return () => {
			if (soundRef.current) {
				soundRef.current.stop();
			}
		};
	}

	const handleSliderChange = (newValue) => {
		setSliderValue(newValue);
	
		// Update the volume when the slider is changed
		if (soundRef.current) {
		  soundRef.current.volume(newValue / 100);
		}
	  };

	return (
		<Flex
			w={{ sm: '100%', md: 'auto' }}
			alignItems="center"
			flexDirection="row"
			bg={menuBg}
			flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
			p="10px"
			borderRadius="30px"
			boxShadow={shadow}>
			{name != 'Authentication' && name != 'Home' && name != 'Certificate Generator' && name !="Video Kyc" &&
				<Flex
					bg={ethBg}
					display={true ? 'flex' : 'none'}
					borderRadius="30px"
					ms="auto"
					p="6px"
					align="center"
					me="6px">
					<Flex align="center" justify="center" bg={ethBox} h="29px" w="29px" borderRadius="30px" me="7px">
						<Icon color={ethColor} w="9px" h="14px" as={FaEthereum} />
					</Flex>
					<Text w="max-content" color={ethColor} fontSize="sm" fontWeight="700" me="6px">
						{balance}
						<Text as="span" display={{ base: 'none', md: 'unset' }}>
							{' '}
							ETH
						</Text>
					</Text>
				</Flex>
			}
			<SidebarResponsive routes={routes} />
			<Menu >
				<MenuButton ms='5px' p="0px">
					<Icon mt="0px" as={MdNotificationsNone} color={navbarIcon} w="18px" h="18px" />
				</MenuButton>
				<MenuList
					boxShadow={shadow}
					p="20px"
					borderRadius="20px"
					bg={menuBg}
					border="none"
					mt="22px"
					me={{ base: '30px', md: 'unset' }}
					minW={{ base: 'unset', md: '400px', xl: '450px' }}
					maxW={{ base: '360px', md: 'unset' }}>
					<Flex jusitfy="space-between" w="100%" mb="20px">
						<Text fontSize="md" fontWeight="600" color={textColor}>
							Notifications
						</Text>

						<IconButton bg='transparent' icon={<RiChatDeleteFill className='h-4 w-4' />} color={textColorBrand} onClick={() => clear()} isRound='true' ms="auto" />

					</Flex>
					<Flex flexDirection="column" >
						{notifications.length != 0 ? notifications.map((notification) => (
							<MenuItem key={notification.id} bg='transparent' _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} px="0" borderRadius="8px" mb="10px">
								<ItemContent icon={notification.icon} info={notification.content} />
							</MenuItem>
						)) : "No Notifications yet !!"
						}
					</Flex>
				</MenuList>
			</Menu>

			<Menu >
				<MenuButton ms='5px' p="0px" onClick={() => playbg()}>
					<Icon mt="0px" as={HiMiniSpeakerWave} color={navbarIcon} w="18px" h="18px" />
				</MenuButton>
				<MenuList
					boxShadow={shadow}
					p="20px"
					borderRadius="20px"
					bg={menuBg}
					border="none"
					mt="22px"
					me={{ base: '30px', md: 'unset' }}

				// minW={{ base: 'unset', md: '400px', xl: '450px' }}
				// 	maxW={{ base: '360px', md: 'unset' }}
				>   
				  <Flex gap="5">
					<Slider aria-label='slider-ex-4' defaultValue={30} onChange={handleSliderChange}>
						<SliderTrack >
							<SliderFilledTrack  />
						</SliderTrack>
						<SliderThumb boxSize={6}>
							<Box color="blue"   as={HiMiniSpeakerWave} />
						</SliderThumb>
					</Slider>
					<Text>{sliderValue}</Text>
					</Flex>
				</MenuList>
			</Menu>

			<FixedPlugin />
			<ThemeEditor navbarIcon={navbarIcon} />

			<Menu>
				<MenuButton
					fontSize='md'
					bg={profileColor}
					fontWeight='500'
					w='35px'
					h='35px'
					borderRadius='50%'
					color={profileText}
				//colorScheme='brand'
				>

					{name?.charAt(0).toUpperCase()}
				</MenuButton>
				<MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px" bg={menuBg} border="none">
					<Flex w="100%" mb="0px">
						<Text
							ps="20px"
							pt="16px"
							pb="10px"
							w="100%"
							borderBottom="1px solid"
							borderColor={borderColor}
							fontSize="sm"
							fontWeight="700"
							color={textColor}>
							👋&nbsp; Hey, EtherDocs user
						</Text>
					</Flex>
					<Flex flexDirection="column" p="10px">
						<MenuItem bg='transparent' _hover={{ bg: 'none' }} _focus={{ bg: 'none' }} borderRadius="8px" px="14px">
							<Text fontSize="sm">Profile Settings</Text>
						</MenuItem>

						{!isLoggedIn(role) ?
							<MenuItem
								bg='transparent'
								_hover={{ bg: 'none' }}
								_focus={{ bg: 'none' }}

								borderRadius="8px"
								px="14px"

								onClick={() => navigate("/AuthPage/signup")}
							>
								<Text fontSize="sm">Sign Up</Text>

							</MenuItem>
							: role != 'owner' ?
								<MenuItem
									bg='transparent'
									_hover={{ bg: 'red.100' }}
									_focus={{ bg: 'red.100' }}
									color="red.600"
									borderRadius="8px"
									px="14px"
									onClick={() => handleLogout()}
								>
									<Text fontSize="sm">Log out</Text>

								</MenuItem>
								: <></>}
					</Flex>
				</MenuList>
			</Menu>
		</Flex>
	);
}

HeaderLinks.propTypes = {
	variant: PropTypes.string,
	fixed: PropTypes.bool,
	secondary: PropTypes.bool,
	onOpen: PropTypes.func
};
