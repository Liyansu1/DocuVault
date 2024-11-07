import React from "react";

import { Icon } from "@chakra-ui/react";
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
} from "react-icons/md";
import { PiStudentFill } from "react-icons/pi";
import { FaUniversity } from "react-icons/fa";
import { FaBuilding } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import HomePage from "./pages/HomePage";
import StudentPage from "./pages/StudentPage";
import UniversityPage from "./pages/UniversityPage";
import CompanyPage from "./pages/CompanyPage";
import AuthPage from "./pages/AuthPage";
import OwnerPage from "./pages/OwnerPage";
import { GrTest } from "react-icons/gr";
import { PiCertificateFill } from "react-icons/pi";
import { FaVideo } from "react-icons/fa";
const routes = [
  {
    name: "Home",
    path: "/",
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: <HomePage/>,
    
  },
  {
    name: "Student", role:"student",
    path: "/StudentPage",
    icon: (
      <Icon
        as={PiStudentFill}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: <StudentPage/>,
  },
  {
    name: "University",  role:'university',
   
    icon: <Icon as={FaUniversity} width='20px' height='20px' color='inherit' />,
    path: "/UniversityPage",
    component: <UniversityPage/>,
  },
  {
    name: "Company",role:'company',
  
    path: "/CompanyPage",
    icon: <Icon as={FaBuilding} width='20px' height='20px' color='inherit' />,
    component: <CompanyPage/>,
  },
  
  {
    name: "Owner", role:'owner',
   
    path: "/OwnerPage",
    icon: <Icon as={MdAdminPanelSettings} width='20px' height='20px' color='inherit' />,
    component: <OwnerPage/>,
  },
  {
    name: "Authentication",
   
    path: "/AuthPage/login",path3: "/AuthPage/signup",path2:"/AuthPage/:type",
    icon: <Icon as={MdLock} width='20px' height='20px' color='inherit' />,
    component: <AuthPage/>,
  }
  
  
];

export default routes;
