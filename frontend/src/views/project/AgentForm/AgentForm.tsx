import { forwardRef, useState } from 'react'
import { FormContainer } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import hooks from '@/components/ui/hooks'
import { Form, Formik, FormikProps } from 'formik'
import BasicInformationFields from './BasicInformationFields'
import cloneDeep from 'lodash/cloneDeep'
import * as Yup from 'yup'
import { Card, toast } from '@/components/ui'
import ApiService from '@/services/ApiService'
import Notification from '@/components/ui/Notification'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type FormikRef = FormikProps<any>

type InitialData = {
    _id?: string
    name?: string
    organizationName?: string
    description?: string
   
}

export type FormModel = Omit<InitialData, 'tags'> & {
    tags: { label: string; value: string }[] | string[]
}

export type SetSubmitting = (isSubmitting: boolean) => void

export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>

type OnDelete = (callback: OnDeleteCallback) => void

type AgentForm = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void
}

const { useUniqueId } = hooks

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Agent Name Required'),
    
})

const AgentForm = forwardRef<FormikRef, AgentForm>((props, ref) => {
    const { type, initialData, onFormSubmit, onDiscard, onDelete } = props

    const handleUpdate = async (values: FormModel) => {
        try {
            const agentId = values._id
            const response = await ApiService.fetchData({
                url: `/agent/${agentId}`,
                method: 'put',
                data: values,
            })
            toast.push(
                <Notification
                    title={'Successfuly updated'}
                    type="success"
                    duration={2500}
                >
                    Agent successfully updated
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
        } catch (error) {
            console.log(error)
        }
        
    }

    return (
        <Card>
            <div className="min-w-[576px] mx-auto">
                <Formik
                    innerRef={ref}
                    initialValues={{
                        ...initialData,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values: FormModel, { setSubmitting }) => {
                        const formData = cloneDeep(values)
                        onFormSubmit?.(formData, setSubmitting)
                    }}
                >
                    {({ values, touched, errors, isSubmitting }) => (
                        <Form>
                            <FormContainer>
                                <div>
                                    <div className="lg:col-span-2">
                                        <BasicInformationFields
                                            touched={touched}
                                            errors={errors}
                                        />
                                    </div>
                                    <div className="md:flex items-center">
                                        <Button
                                            size="sm"
                                            className="ltr:mr-3 rtl:ml-3"
                                            type="button"
                                            onClick={() => onDiscard?.()}
                                            variant="solid"
                                            color="red-500"
                                        >
                                            Back
                                        </Button>
                                        {type === 'new' && (
                                            <Button
                                                size="sm"
                                                variant="solid"
                                                loading={isSubmitting}
                                                type="submit"
                                            >
                                                Create
                                            </Button>
                                        )}
                                        {type === 'edit' && (
                                            <Button
                                                size="sm"
                                                variant="solid"
                                                loading={isSubmitting}
                                                type="button"
                                                onClick={() =>
                                                    handleUpdate(values)
                                                }
                                            >
                                                Update
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </div>
        </Card>
    )
})

AgentForm.displayName = 'AgentForm'

export default AgentForm
