import AgentForm, { FormModel, SetSubmitting } from '@/views/project/AgentForm'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useNavigate } from 'react-router-dom'
import { apiCreateAgent } from '@/services/AgentService'
import useQuery from '@/utils/hooks/useQuery'
import { useAppSelector } from '../AgentList/store'

const AgentNew = () => {
    const navigate = useNavigate()
    const query = useQuery()
    const index = query.get('index')
    const agents = useAppSelector((state) => state.agentList.data.agents)
    const addAgent = async (data: FormModel) => {
        const response = await apiCreateAgent<boolean, FormModel>(data)
        console.log(response)
        return response.data
    }

    const handleFormSubmit = async (
        values: FormModel,
        setSubmitting: SetSubmitting,
    ) => {
        setSubmitting(true)
        const success = await addAgent(values)
        if (success) {
            toast.push(
                <Notification
                    title={'Successfuly added'}
                    type="success"
                    duration={2500}
                >
                    Agent successfuly added
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            navigate('/home/project/agent-list')
        }
        setSubmitting(false)
    }

    const handleDiscard = () => {
        navigate('/home/project/agent-list')
    }

    const initialData = index
        ? {
              _id: agents[parseInt(index)]._id,
              name: agents[parseInt(index)].name,
              description: agents[parseInt(index)].description,
              organizationName: agents[parseInt(index)].organizationName,
          }
        : {
              name: '',
              description: '',
              organizationName: '',
          }

    const type = index ? 'edit' : 'new'
    return (
        <div className="mx-auto min-w-[640px]">
            <AgentForm
                type={type}
                initialData={initialData}
                onFormSubmit={handleFormSubmit}
                onDiscard={handleDiscard}
            />
        </div>
    )
}

export default AgentNew
