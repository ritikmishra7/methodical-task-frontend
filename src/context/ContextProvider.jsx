import React, { createContext, useContext, useEffect, useState } from "react";
import { axiosClient } from "../config/axios";

const StateContext = createContext();

export const ContextProvider = ({ children }) =>
{
	const [userDetails, setUserDetails] = useState({});
	const [projectDetails, setProjectDetails] = useState({});
	const [projectMembers, setProjectMembers] = useState({});
	const [loading, setLoading] = useState(true);

	const fetchUserData = async () =>
	{
		setLoading(true);
		const response = await axiosClient.get("/user");
		setUserDetails(response.data.result);
		setLoading(false);
	};

	useEffect(() =>
	{
		fetchUserData();
	}, []);

	return (
		<StateContext.Provider
			value={
				{
					userDetails, setUserDetails,
					projectDetails, setProjectDetails,
					projectMembers, setProjectMembers,
					loading, setLoading
				}}
		>
			{children}
		</StateContext.Provider>
	);
};

export const useStateContext = () => useContext(StateContext);
