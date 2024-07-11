import useQuery from '@/utils/hooks/useQuery'
import TrainAgentForm from './TrainAgentForm'
import { Container, Loading } from '@/components/shared'
import { useEffect, useState } from 'react'
import ApiService from '@/services/ApiService'
import { AgentInformation } from '../AgentList/store'

const TrainAgent = () => {
    // get agent number
    const [isPageLoading, setIsPageLoading] = useState(false)
    const [agent, setAgent] = useState<AgentInformation>({} as AgentInformation)
    const [uploadedFiles, setUploadedFiles] = useState([])
    const query = useQuery()
    const id = query.get('id')

    useEffect(() => {
        getAgent()
    }, [])

    // // Get agent information
    const getAgent = async () => {
        setIsPageLoading(true)
        try {
            const response = await ApiService.fetchData<any>({
                url: `/agent/${id}`,
                method: 'get',
            })

            setAgent(response.data.data)
            const res = await ApiService.fetchData<any>({
                url: `/upload/${id}`,
                method: 'get',
            })

            setUploadedFiles(res.data.data)
        } catch (error) {
            console.log(error)
        }
        setIsPageLoading(false)
    }

    return (
        <Container className="h-full">
            <Loading loading={isPageLoading}>
                {agent && (
                    <TrainAgentForm
                        type="new"
                        initialData={agent}
                        uploadedFileData={uploadedFiles}
                        setIsPageLoading={setIsPageLoading}
                        onFormSubmit={() => {}}
                        onDiscard={() => {}}
                    />
                )}
            </Loading>
        </Container>
    )
}

export default TrainAgent
