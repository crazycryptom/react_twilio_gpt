import Spinner from "./Spinner";

type Props = {
    isLoading: boolean;
}
export default function CommonSpinner({isLoading}: Props) {
    return (
    <>
        {isLoading && 
        <div className='fixed top-0 left-0 z-50 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50'>
            <Spinner size="2rem" />
        </div>}
    </>
    )
}