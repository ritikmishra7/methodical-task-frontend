import React, { useEffect, useState } from 'react';
import { MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { Menu, Avatar, Modal, message } from 'antd';
import { useStateContext } from "../../../context/ContextProvider";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import './ChatIntro.css';
import DebounceSelect from "../Collab/DebounceSelect";
import { axiosClient } from "../../../config/axios";

const ChatIntro = () =>
{

	const { activeProjectName, activeProjectDetails, userDetails } = useStateContext();
	const [items, setItems] = useState([]);
	const [selectedKey, setSelectedKey] = useState('project_chat');
	const navigate = useNavigate();


	const [personalMembers, setPersonalMembers] = useState([]);
	const [newMessageModal, setNewMessageModal] = useState(false);
	const { chat_id } = useParams();
	const [invitedUsers, setInvitedUsers] = useState([]);

	function getItem(label, key, icon, children, type)
	{
		return {
			key,
			icon,
			children,
			label,
			type,
		};
	}

	useEffect(() =>
	{
		// Construct menu items
		const newItems = [
			getItem('New Message', 'new_chat', <PlusOutlined />),
			getItem(`${activeProjectName}`, 'project_chat', <Avatar src={activeProjectDetails?.thumbnail} />),
			getItem('Direct messages', 'direct_message', <MessageOutlined />, personalMembers.map((chatEntity) =>
			{
				return getItem(chatEntity.label, chatEntity._id, <Avatar.Group maxCount={2}>
					{chatEntity.profile_pictures.map((profile_picture, index) =>
					{
						return <Avatar key={index} src={profile_picture} />;
					})}
				</Avatar.Group>);
			})),
			{
				type: 'divider',
			},
		];

		// Update state with new items
		setItems(newItems);
	}, [activeProjectName, activeProjectDetails, personalMembers]);

	async function fetchChatEntities()
	{
		try 
		{
			if (!activeProjectDetails._id)
				return;

			const { data } = await axiosClient.get(`/projects/${activeProjectDetails._id}/personal_chats`);
			const chatEntities = data.result.map((chatEntity) =>
			{
				let entityMembers = [];
				chatEntity.receiver.map(receiver => entityMembers.push(receiver._id));
				entityMembers.push(chatEntity.sender._id);
				return {
					_id: chatEntity._id,
					label: getChatEntityLabel(chatEntity, userDetails._id),
					profile_pictures: getProfilePictures(chatEntity, userDetails._id),
					members: entityMembers
				};
			});
			setPersonalMembers(chatEntities);
		} catch (error) 
		{
			console.log(error);
		}
	}

	useEffect(() =>
	{
		fetchChatEntities();
		if (chat_id)
		{
			setSelectedKey(chat_id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function fetchUserList(username)
	{
		try
		{

			const { data } = await axiosClient.get(`/projects/${activeProjectDetails._id}/members`);
			const matchedUsers = data.result.map((member) =>
			{
				return {
					label: member.user.display_name,
					value: member.user._id,
					title: member.user.profile_picture
				};
			});

			const currentUserIndex = matchedUsers.findIndex(user => user.value === userDetails._id);
			matchedUsers.splice(currentUserIndex, 1);

			return matchedUsers;
		}
		catch (error)
		{
			console.log(error);
			message.error(error.message);
			const members = activeProjectDetails.members.map((member) =>
			{
				return {
					label: member.user.display_name,
					value: member.user._id
				};
			});
			return members;
		}
	}

	const getChatEntityLabel = (chatEntity, userId) =>
	{
		let label = '';

		const members = [];
		members.push(chatEntity.sender);
		chatEntity.receiver.map(receiver => members.push(receiver));

		members.map(member =>
		{
			if (member._id !== userId)
			{
				label += `${member.display_name}, `;
			}
			return null;
		});

		if (label[label.length - 2] === ',')
		{
			label = label.slice(0, -2);
		}
		return label;
	};

	const getProfilePictures = (chatEntity, userId) =>
	{
		const profile_pictures = [];
		chatEntity.receiver.map(receiver =>
		{
			if (receiver._id !== userId)
			{
				profile_pictures.push(receiver.profile_picture);
			}
			return null;
		});

		if (chatEntity.sender._id !== userId)
		{
			profile_pictures.push(chatEntity.sender.profile_picture);
		}

		return profile_pictures;
	};

	const handleNewMessageCreation = async () =>
	{
		try 
		{
			const receiver = invitedUsers.map(user => user.value);
			const { data: chatEntity } = await axiosClient.post(`/projects/${activeProjectDetails._id}/personal_chat`,
				{
					receiver
				});

			const label = getChatEntityLabel(chatEntity.result, userDetails._id);
			const _id = chatEntity.result._id;
			const profile_pictures = getProfilePictures(chatEntity.result, userDetails._id);
			const members = [];
			chatEntity.result.receiver.map(receiver => members.push(receiver._id));
			members.push(chatEntity.result.sender._id);
			//BAD-PRACTICE:directly comparing strings
			if (chatEntity.message !== "Successfully created Direct Message Entity") 
			{
				setSelectedKey(chatEntity.result._id);
				navigate(`/project/${activeProjectDetails._id}/chat/${_id}`, {
					state: { chatEntity: { _id, label, profile_pictures, members } }
				});
				return;
			}
			const newPersonalMembers = [...personalMembers, { _id, label, profile_pictures, members }];
			setPersonalMembers(newPersonalMembers);
			setSelectedKey(_id);
			navigate(`/project/${activeProjectDetails._id}/chat/${_id}`, {
				state: { chatEntity: { _id, label, profile_pictures, members } }
			});
		} catch (error) 
		{
			console.log(error);
		}
		finally
		{
			setNewMessageModal(false);
			setInvitedUsers([]);

		}
	};

	const handleNewMessageCancel = () =>
	{
		setNewMessageModal(false);
		setInvitedUsers([]);
	};

	const onClick = (e) =>
	{
		if (e.key === 'new_chat')
		{
			setSelectedKey('new_chat');
			setNewMessageModal(true);
		}
		else if (e.key === 'project_chat')
		{
			setSelectedKey('project_chat');
			navigate(`/project/${activeProjectDetails._id}/chat`);
		}
		else
		{
			const selectedChatEntity = personalMembers.find(singleChatEntity => singleChatEntity._id === e.key);

			setSelectedKey(e.key);
			navigate(`/project/${activeProjectDetails._id}/chat/${e.key}`, { state: { chatEntity: selectedChatEntity } });
		}
	};
	return (
		<div className="personal-chat-wrapper">
			<Menu
				onClick={onClick}
				defaultOpenKeys={['direct_message']}
				selectedKeys={[selectedKey]}
				mode="inline"
				items={items}
				style={{ width: 256 }}
			/>
			<Modal title="Send Direct Message" open={newMessageModal} onOk={handleNewMessageCreation} onCancel={handleNewMessageCancel}>
				<DebounceSelect
					mode="multiple"
					value={invitedUsers}
					placeholder="Invite users to Collab"
					fetchOptions={fetchUserList}
					onChange={(newValue) =>
					{
						setInvitedUsers(newValue);
					}}
					style={{
						width: '80%',
					}}
				/>
			</Modal>
			<Outlet />
		</div>
	);
};
export default ChatIntro;
