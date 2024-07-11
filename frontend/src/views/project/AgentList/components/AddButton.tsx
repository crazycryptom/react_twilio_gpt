import Button from '@/components/ui/Button'
import { HiDownload, HiPlusCircle } from 'react-icons/hi'
import { Link } from 'react-router-dom'

const AddButton = () => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center">
            <Link
                className="block lg:inline-block md:mb-0 mb-4"
                to="/home/project/agent-new"
            >
                <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
                    Add Agent
                </Button>
            </Link>
        </div>
    )
}

export default AddButton
