import { Routes, Route } from 'react-router-dom';
import ProjectLayout from "../components/layout/Layout/ProjectLayout";
import OnlyIfLoggedIn from "../components/ui/Auth/OnlyIfLoggedIn";
import OnlyIfNotLoggedIn from "../components/ui/Auth/OnlyIfNotLoggedIn";
import { Login, Register, Dashboard, ProjectMembers, TaskInfo, TaskList, ChatProject, DefaultPage, EditProject, ForgotPassword, ResetPassword, Account, InviteAccept, DeleteProject, Kanban } from "../page";
import Collab from '../page/project/Collab/Collab';
import CollabIntro from "../page/project/Collab/CollabIntro";
import ChatIntro from "../page/project/ChatIntro/ChatIntro";
import ChatPersonal from "../page/project/ChatPersonal/ChatPersonal";

const RouterComponent = () =>
{
	return (
		<Routes>
			<Route element={<OnlyIfNotLoggedIn />}>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/forgotPassword" element={<ForgotPassword />} />
				<Route path="/resetPassword/:userId/:resetToken" element={<ResetPassword />} />
			</Route>
			<Route element={<OnlyIfLoggedIn />}>
				<Route element={<ProjectLayout onDashboard={true} />}>
					<Route path='/' element={<Dashboard />} />
					<Route path='/user/profile' element={<Account />} />
					<Route path="/:user_name/:project_id/invitations" element={<InviteAccept />} />
				</Route>
				<Route element={<ProjectLayout onDashboard={false} />}>
					<Route path="/project/:project_id/tasks" element={<TaskList />} />
					<Route path="/project/:project_id/members" element={<ProjectMembers />} />
					<Route path="/project/:project_id/tasks/:task_key" element={<TaskInfo />} />
					<Route element={<ChatIntro />} >
						<Route path="/project/:project_id/chat" element={<ChatProject />} />
						<Route path="/project/:project_id/chat/:chat_id" element={<ChatPersonal />} />

					</Route>
					<Route path="/project/:project_id/edit" element={<EditProject />} />
					<Route path="/project/:project_id/delete" element={<DeleteProject />} />
					<Route path="/project/:project_id/kanban" element={<Kanban />} />
					<Route path="/project/:project_id/collab" element={<CollabIntro />} />
					<Route path="/project/:project_id/collab/:collabId" element={<Collab />} />
				</Route>
			</Route>
			<Route path="*" element={<DefaultPage />} />
		</Routes>
	);
};

export default RouterComponent;
