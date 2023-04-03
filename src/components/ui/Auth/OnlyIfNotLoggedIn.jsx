import React, { useEffect } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

const OnlyIfNotLoggedIn = () =>
{
	const navigate = useNavigate();

	const fetchRefreshToken = async () =>
	{
		const response = await axios.create({
			withCredentials: true
		}).get(process.env.REACT_APP_BASE_URL + "/auth/refresh");

		let newToken = response.data.result.accessToken;
		localStorage.setItem("accessToken", newToken);

		navigate("/");
	};

	useEffect(() =>
	{
		let token = localStorage.getItem("accessToken");

		if (!token)
		{
			fetchRefreshToken();
		}
		else
		{
			navigate("/");
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<Outlet />
	);
};

export default OnlyIfNotLoggedIn;
