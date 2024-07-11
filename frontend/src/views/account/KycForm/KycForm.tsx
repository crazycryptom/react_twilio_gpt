import { useEffect, useMemo, lazy, Suspense, useState } from 'react'
import Container from '@/components/shared/Container'
import reducer, { getForm, useAppDispatch, useAppSelector } from './store'
import Loading from '@/components/shared/Loading'
import { injectReducer, setUser } from '@/store'
import { FormModel, SetSubmitting } from './components/PersonalInformation'
import ApiService from '@/services/ApiService'
import { Card, Notification, toast } from '@/components/ui'
import { motion } from 'framer-motion'

injectReducer('accountDetailForm', reducer)

const PersonalInformation = lazy(
    () => import('./components/PersonalInformation'),
)

const DetailForm = () => {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)

    const personalInformation = useAppSelector(
        (state) => state.accountDetailForm.data.personalInformation,
    )

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        await dispatch(getForm())
        setIsLoading(false)
    }

    const handleFormSubmit = async (
        values: FormModel,
        setSubmitting: SetSubmitting,
    ) => {
        setSubmitting(true)
        try {
            const response = await ApiService.fetchData<any>({
                url: '/user/update-me',
                method: 'patch',
                data: values,
            })
            toast.push(
                <Notification
                    title={'Successfuly updated'}
                    type="success"
                    duration={2500}
                >
                    User successfully updated
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            dispatch(setUser(response.data.personalInformation))
        } catch (error) {
            console.log(error)
        }
        setSubmitting(false)
    }

    return (
        <Container className="h-full">
            <Loading loading={isLoading}>
                <motion.div
                    transition={{ duration: 1, type: 'tween' }}
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                >
                    <Suspense fallback={<></>}>
                        {!isLoading && (
                            <>
                                <PersonalInformation
                                    type="edit"
                                    initialData={personalInformation}
                                    onFormSubmit={handleFormSubmit}
                                />
                            </>
                        )}
                    </Suspense>
                </motion.div>
            </Loading>
        </Container>
    )
}

export default DetailForm
