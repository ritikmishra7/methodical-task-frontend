import React from "react";
import { Popover, Tooltip, message, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, BellOutlined } from "@ant-design/icons";
import { TbLogout } from "react-icons/tb";
import { useThemeContext } from "../../../context/ThemeProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Navbar.css';

const NavBar = (props) =>
{
	const { collapsed, setCollapsed } = useThemeContext();
	const routes = useNavigate();

	const handleLogout = async () =>
	{
		try
		{
			const response = await axios.post(process.env.REACT_APP_BASE_URL + "/auth/logout");
			localStorage.removeItem("accessToken");
			message.success(response.data.message);
			routes("/login");
		}
		catch (error)
		{
			message.error(error.response.data.message);
		}
	};

	async function testRefresh()
	{
		try
		{
			const response = await axios.get(process.env.REACT_APP_BASE_URL + "/projects");

		} catch (error)
		{
			console.log("error: ", error);
		}
	}


	return (
		<div className="navbar-notification-main-wrapper">
			{
				!props.navIconDisabled ? <div onClick={() => setCollapsed(!collapsed)} >
					{collapsed ? <MenuUnfoldOutlined className="navbar-menu-icon" /> : <MenuFoldOutlined className="navbar-menu-icon" />}
				</div>
					:
					<div></div>
			}
			<div className="navbar-notification-wrapper">
				<Button onClick={testRefresh}>Project data</Button>
				<Tooltip title="Logout" className="logout-btn">
					<TbLogout size={30} onClick={handleLogout} />
				</Tooltip>

				<Popover placement="bottomRight" title={"Notification"} content={Notification} trigger="click">
					<BellOutlined className="navbar-belloutlined-icon" />
				</Popover>
			</div>
		</div>

	);
};

const Notification = () =>
{
	return (
		<div className="navbar-notification-content">
		</div>
	);
};

export default NavBar;
