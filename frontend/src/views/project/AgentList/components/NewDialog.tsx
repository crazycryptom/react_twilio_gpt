import { useEffect, useRef, useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik, FieldProps } from 'formik'
import { toggleNewDialog, useAppDispatch, useAppSelector } from '../store'
import { apiGetAnswerFromGPT } from '@/services/GptServices'
import { Alert, Card, InputGroup, Switcher } from '@/components/ui'
import { HiArrowCircleRight } from 'react-icons/hi'
import { AxiosError } from 'axios'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'

type FormModel = {
    message: string
}

export type DialogLog = {
    text: string
    isUserQuestion: boolean
}
const NewDialog = () => {
    const messageEndRef = useRef<HTMLDivElement>(null)
    const [dialogLogs, setDialogLogs] = useState<DialogLog[]>([])

    const [reply, setReply] = useState('')
    const [errorMessage, setErrorMessage] = useTimeOutMessage()
    const [checked, setChecked] = useState(true)
    const dispatch = useAppDispatch()
    const newDialog = useAppSelector((state) => state.agentList.data.newDialog)
    const selectedAgent = useAppSelector(
        (state) => state.agentList.data.selectedAgent,
    )

    const onSwitcherToggle = (val: boolean) => {
        console.log(checked)
        setChecked(!val)
    }
    const onDialogClose = () => {
        dispatch(toggleNewDialog(false))
        setDialogLogs([])
    }

    const onSubmit = async (
        values: FormModel,
        setSubmitting: (isSubmitting: boolean) => void,
        resetForm: () => void,
    ) => {
        setSubmitting(true)
        try {
            let reply
            const { message } = values
            const context = dialogLogs
                .map((c) =>
                    c.isUserQuestion ? `Human: ${c.text}` : `AI: ${c.text}`,
                )
                .join('\n')
            console.log(context)
            reply = await apiGetAnswerFromGPT({
                context,
                question: message,
                id: selectedAgent,
            })

            setReply(reply?.data.answer)
            setDialogLogs([
                ...dialogLogs,
                { text: message, isUserQuestion: true },
                { text: reply?.data.answer, isUserQuestion: false },
            ])
            setSubmitting(false)
            resetForm()
        } catch (errors) {
            setErrorMessage(
                (errors as AxiosError<{ message: string }>)?.response?.data
                    ?.message || (errors as Error).toString(),
            )
            setSubmitting(false)
        }
    }

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [dialogLogs])

    return (
        <Dialog
            isOpen={newDialog}
            className="!w-[800px]"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
        >
            <div className="flex justify-between mr-10">
                <h4>Chat with Agent</h4>

                {/* <div className="flex">
                    <p className="mr-2">fine-tuned model</p> 
                    <Switcher checked={checked} onChange={onSwitcherToggle} />
                    <p className="ml-2">GPT-3.5-turbo</p>
                </div> */}
            </div>
            {errorMessage && (
                <Alert showIcon className="mb-4" type="danger">
                    {errorMessage}
                </Alert>
            )}

            <div className="mt-4">
                <Formik
                    initialValues={{
                        message: '',
                    }}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        onSubmit(values, setSubmitting, resetForm)
                    }}
                >
                    {({ touched, errors, values }) => (
                        <Form>
                            <FormContainer>
                                <FormItem
                                    invalid={errors.message && touched.message}
                                    errorMessage={errors.message}
                                >
                                    <InputGroup size="sm">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="message"
                                            placeholder="Type your message"
                                            component={Input}
                                        />
                                        <Button
                                            variant="solid"
                                            type="submit"
                                            icon={<HiArrowCircleRight />}
                                        ></Button>
                                    </InputGroup>
                                </FormItem>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </div>
            <Card className="overflow-auto max-h-[400px] h-[400px]">
                {dialogLogs.map((log, i) => (
                    <div key={i} className="p-2 rounded">
                        <div
                            className={`flex ${
                                log.isUserQuestion
                                    ? 'justify-end'
                                    : 'justify-start'
                            }`}
                        >
                            <div
                                className={`p-2 rounded ${
                                    log.isUserQuestion
                                        ? 'bg-emerald-200 '
                                        : 'bg-pink-200 '
                                } max-w-[80%] text-black`}
                            >
                                {`${log.isUserQuestion ? 'You -' : 'Bot -'}`}{' '}
                                {log.text}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messageEndRef} />
            </Card>
            {/* <div className="h-72 overflow-y-scroll border border-gray-300 p-4 text-black"></div> */}
        </Dialog>
    )
}

export default NewDialog
