import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import { countryList } from '@/constants/countries.constant'
import { components } from 'react-select'
import * as Yup from 'yup'
import type { OptionProps, SingleValueProps } from 'react-select'
import type { FieldInputProps, FieldProps } from 'formik'
import { useState, type ComponentType, useEffect } from 'react'
import type { InputProps } from '@/components/ui/Input'
import ApiService from '@/services/ApiService'
import Table from '@/components/ui/Table'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { ConfirmDialog, Loading } from '@/components/shared'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { AxiosError } from 'axios'
import { Alert, Card } from '@/components/ui'
import Container from '@/components/shared/Container'
import { motion } from 'framer-motion'

const { Tr, Th, Td, THead, TBody } = Table

type CountryOption = {
    label: string
    dialCode: string
    value: string
}

type InitialData = {
    dialCode: string
    areaCode: number
    phoneType: string
}
type SelectType = { value: string; label: string }[]

const phoneType: SelectType = [
    { value: 'local', label: 'Local' },
    // { value: 'tollFree', label: 'Toll-Free' },
]

export type FormModel = Omit<InitialData, 'tags'> & {
    tags: { label: string; value: string }[] | string[]
}

const { SingleValue } = components

const NumberInput = (props: InputProps) => {
    return <Input {...props} value={props.field.value} />
}

const NumericFormatInput = ({
    onValueChange,
    ...rest
}: Omit<NumericFormatProps, 'form'> & {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    form: any
    field: FieldInputProps<unknown>
}) => {
    return (
        <NumericFormat
            customInput={Input as ComponentType}
            type="text"
            autoComplete="off"
            onValueChange={onValueChange}
            {...rest}
        />
    )
}

const PhoneSelectOption = ({
    innerProps,
    data,
    isSelected,
}: OptionProps<CountryOption>) => {
    return (
        <div
            className={`cursor-pointer flex items-center justify-between p-2 ${
                isSelected
                    ? 'bg-gray-100 dark:bg-gray-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            {...innerProps}
        >
            <div className="flex items-center gap-2">
                <span>
                    ({data.value}) {data.dialCode}
                </span>
            </div>
        </div>
    )
}

const PhoneControl = (props: SingleValueProps<CountryOption>) => {
    const selected = props.getValue()[0]
    return (
        <SingleValue {...props}>
            {selected && <span>{selected.dialCode}</span>}
        </SingleValue>
    )
}

const validationSchema = Yup.object().shape({
    dialCode: Yup.string().required('Please select dial code'),
    phoneType: Yup.string().required('Please select phone type'),
})

const CallSettingForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isPageLoading, setIsPageLoading] = useState(false)
    const [isValidating, setIsValidating] = useState(false)
    const [phoneNumbers, setPhoneNumbers] = useState<any>([])
    const [isPurchased, setIsPurchased] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [phoneNumToDelete, setPhoneNumToDelete] = useState<any>({})
    const [numberToValidate, setNumberToValidate] = useState('')
    const [validationCode, setValidationCode] = useState('')
    const [message, setMessage] = useTimeOutMessage()

    // Handle buy number
    const buyPhoneNumber = async (phoneNum: any) => {
        setIsLoading(true)
        try {
            const selectedNumber = phoneNum.phoneNumber
            const response = await ApiService.fetchData<any>({
                url: '/twilio/buy-number',
                method: 'post',
                data: {
                    selectedNumber,
                },
            })
            const { friendlyName, phoneNumber, sid, capabilities } =
                response.data.purchasedNumber

            const purchasedNumber = {
                friendlyName,
                phoneNumber,
                capabilities: {
                    MMS: capabilities.mms,
                    SMS: capabilities.sms,
                    voice: capabilities.voice,
                },
                sid,
            }

            const result = await savePhoneNumber(purchasedNumber)
            setPhoneNumbers([result.data.data])
            setIsPurchased(true)
            toast.push(
                <Notification
                    title={'Successfuly purchased'}
                    type="success"
                    duration={2500}
                >
                    Twilio number successfuly purchased
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
    }
    // Handle delete number
    const deletePhoneNumber = async (phoneNum: any) => {
        setIsLoading(true)
        try {
            const { sid, _id } = phoneNum
            const response = await ApiService.fetchData<any>({
                url: '/twilio/delete-number',
                method: 'post',
                data: { sid, _id },
            })
            setIsPurchased(false)
            setPhoneNumbers([])
            toast.push(
                <Notification
                    title={'Successfully removed'}
                    type="success"
                    duration={2500}
                >
                    Twilio number successfully removed
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
        setIsConfirmOpen(false)
    }
    // Handle Form Submit
    const onSubmit = async (
        values: any,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        setSubmitting(true)
        try {
            const response = await ApiService.fetchData<any>({
                url: '/twilio/search-numbers',
                method: 'post',
                data: values,
            })
            console.log(response)
            setPhoneNumbers([...response.data.phoneNumbers])
            setSubmitting(false)
        } catch (errors) {
            console.log(errors)
            setPhoneNumbers([])
            setSubmitting(false)
        }
    }

    // Handle save phone number to database
    const savePhoneNumber = async (purchasedNumber: any) => {
        const response = await ApiService.fetchData<any>({
            url: '/twilio/save-number',
            method: 'post',
            data: purchasedNumber,
        })
        return response
    }

    useEffect(() => {
        getTwilioNumber()
    }, [])

    useEffect(() => {
        getPhoneNumber()
    }, [])

    // Get all Twilio phoneNumbers available
    const getTwilioNumber = async () => {
        try {
            setIsPageLoading(true)
            const response = await ApiService.fetchData<any>({
                url: '/twilio/get-numbers',
                method: 'get',
            })
            const phoneNumbers = response.data.data
            if (phoneNumbers && phoneNumbers.length > 0) {
                setPhoneNumbers([...phoneNumbers])
                setIsPurchased(true)
            } else {
                setPhoneNumbers([])
                setIsPurchased(false)
            }
            setIsPageLoading(false)
        } catch (error) {
            console.log(error)
        }
    }

    // Get the phone number of user
    const getPhoneNumber = async () => {
        try {
            const response = await ApiService.fetchData<any>({
                url: '/user/me',
                method: 'get',
            })
            const person = response.data.personalInformation
            const phone = person.dialCode + person.phoneNumber
            if (!phone) {
                setNumberToValidate(
                    'You should enter your number in the profile.',
                )
            } else {
                setNumberToValidate(phone)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const hanldeConfirmClose = () => {
        setIsConfirmOpen(false)
    }

    const handleValidation = async () => {
        setIsValidating(true)
        try {
            console.log(numberToValidate)
            const response = await ApiService.fetchData<any>({
                url: '/twilio/validate-number',
                method: 'post',
                data: { numberToValidate },
            })
            const validationCode = response.data.data
            setValidationCode(validationCode)
            toast.push(
                <Notification
                    title={'Validation Status'}
                    type="success"
                    duration={2500}
                >
                    Validation code received. Please respond to verification
                    call.
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            setIsValidating(false)
        } catch (errors) {
            const errorMessage =
                (errors as AxiosError<{ message: string }>)?.response?.data
                    ?.message || (errors as Error).toString()
            toast.push(
                <Notification title={'Error'} type="danger" duration={5000}>
                    {errorMessage}
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            setIsValidating(false)
        }
    }

    return (
        <Container className="h-full">
            <Loading loading={isPageLoading}>
                <div className="mb-4">
                    <h3 className="mb-2">Call setting</h3>
                    <p>Set your phone and Twilio phone</p>
                </div>
                <motion.div
                    transition={{ duration: 1, type: 'tween' }}
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                        <Card>
                            <div className="mb-8">
                                <h3 className="mb-1">
                                    Phone number validation
                                </h3>
                            </div>
                            <label>Your Phone number</label>
                            <div className="sm:block lg:flex">
                                <Input
                                    type="text"
                                    placeholder=""
                                    className="mt-3 mr-5 sm:w-full lg:w-[50%]"
                                    value={numberToValidate}
                                    onChange={(e) =>
                                        setNumberToValidate(e.target.value)
                                    }
                                    disabled
                                />
                                <Button
                                    size="sm"
                                    loading={isValidating}
                                    className="mt-4"
                                    variant="solid"
                                    type="button"
                                    onClick={handleValidation}
                                >
                                    Validate number
                                </Button>
                            </div>
                            {message && (
                                <Alert showIcon className="mb-4" type="danger">
                                    {message}
                                </Alert>
                            )}
                            <div className="mt-3 mb-10 rounded ">
                                <span className="text-emerald-600">
                                    {validationCode
                                        ? `Your validation code is ${validationCode}. Please respond to verification call.`
                                        : ''}
                                </span>
                            </div>
                        </Card>
                        <Card>
                            <div className="mb-8">
                                <h3 className="mb-2">Twilio number setting</h3>
                            </div>
                            {message && (
                                <Alert showIcon className="mb-4" type="danger">
                                    {message}
                                </Alert>
                            )}
                            <Formik
                                initialValues={{
                                    dialCode: '',
                                    areaCode: null,
                                    phoneType: '',
                                }}
                                enableReinitialize={true}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting }) => {
                                    onSubmit?.(values, setSubmitting)
                                }}
                            >
                                {({
                                    values,
                                    touched,
                                    errors,
                                    isSubmitting,
                                }) => {
                                    return (
                                        <Form>
                                            <FormContainer>
                                                <div className="md:grid grid-cols-2 gap-4">
                                                    <FormItem
                                                        label="Country Code"
                                                        invalid={
                                                            errors.dialCode &&
                                                            touched.dialCode
                                                        }
                                                        errorMessage="Please enter your country code"
                                                    >
                                                        <Field name="dialCode">
                                                            {({
                                                                field,
                                                                form,
                                                            }: FieldProps) => (
                                                                <Select<CountryOption>
                                                                    className="min-w-[130px]"
                                                                    placeholder="Country Code"
                                                                    components={{
                                                                        Option: PhoneSelectOption,
                                                                        SingleValue:
                                                                            PhoneControl,
                                                                    }}
                                                                    field={
                                                                        field
                                                                    }
                                                                    form={form}
                                                                    options={
                                                                        countryList
                                                                    }
                                                                    value={countryList.filter(
                                                                        (
                                                                            country,
                                                                        ) =>
                                                                            country.value ===
                                                                            values.dialCode,
                                                                    )}
                                                                    onChange={(
                                                                        country,
                                                                    ) =>
                                                                        form.setFieldValue(
                                                                            field.name,
                                                                            country?.value,
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </Field>
                                                    </FormItem>
                                                    <FormItem
                                                        label="Phone Type"
                                                        invalid={
                                                            errors.phoneType &&
                                                            touched.phoneType
                                                        }
                                                        errorMessage="Please select the phone type"
                                                    >
                                                        <Field name="phoneType">
                                                            {({
                                                                field,
                                                                form,
                                                            }: FieldProps) => (
                                                                <Select
                                                                    placeholder="Phone Type"
                                                                    field={
                                                                        field
                                                                    }
                                                                    form={form}
                                                                    options={
                                                                        phoneType
                                                                    }
                                                                    value={phoneType.filter(
                                                                        (c) =>
                                                                            c.value ===
                                                                            values.phoneType,
                                                                    )}
                                                                    onChange={(
                                                                        c,
                                                                    ) =>
                                                                        form.setFieldValue(
                                                                            field.name,
                                                                            c?.value,
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </Field>
                                                    </FormItem>
                                                </div>
                                                <div className="md:grid grid-cols-2 gap-4">
                                                    <FormItem
                                                        label="Area Code"
                                                        invalid={
                                                            errors.areaCode &&
                                                            touched.areaCode
                                                        }
                                                        errorMessage={
                                                            errors.areaCode
                                                        }
                                                    >
                                                        <Field name="areaCode">
                                                            {({
                                                                field,
                                                                form,
                                                            }: FieldProps) => {
                                                                return (
                                                                    <NumericFormatInput
                                                                        form={
                                                                            form
                                                                        }
                                                                        field={
                                                                            field
                                                                        }
                                                                        customInput={
                                                                            NumberInput as ComponentType
                                                                        }
                                                                        placeholder="Area Code"
                                                                        onValueChange={(
                                                                            e,
                                                                        ) => {
                                                                            form.setFieldValue(
                                                                                field.name,
                                                                                e.value,
                                                                            )
                                                                        }}
                                                                    />
                                                                )
                                                            }}
                                                        </Field>
                                                    </FormItem>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    {!isPurchased && (
                                                        <Button
                                                            size="sm"
                                                            loading={
                                                                isSubmitting
                                                            }
                                                            variant="solid"
                                                            type="submit"
                                                        >
                                                            Search phone numbers
                                                        </Button>
                                                    )}
                                                </div>
                                            </FormContainer>
                                        </Form>
                                    )
                                }}
                            </Formik>
                        </Card>
                    </div>
                    <Card className="mt-5 overflow-auto max-h-[600px]">
                        <h3>
                            {isPurchased
                                ? 'Your purchased Twilio number'
                                : 'Available Twilio numbers'}
                        </h3>
                        <div className="mt-5">
                            <Table>
                                <THead>
                                    <Tr>
                                        <Th>Friendly Name</Th>
                                        <Th>Phone Number</Th>
                                        <Th>Locality</Th>
                                        <Th>Capabilities</Th>
                                        <Th></Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {phoneNumbers &&
                                        phoneNumbers.length > 0 && (
                                            <>
                                                {phoneNumbers.map(
                                                    (
                                                        phoneNum: any,
                                                        i: number,
                                                    ) => (
                                                        <Tr key={i}>
                                                            <Td>
                                                                {
                                                                    phoneNum.friendlyName
                                                                }
                                                            </Td>
                                                            <Td>
                                                                {
                                                                    phoneNum.phoneNumber
                                                                }
                                                            </Td>
                                                            <Td>
                                                                {
                                                                    phoneNum.locality
                                                                }
                                                            </Td>
                                                            <Td>
                                                                {phoneNum
                                                                    .capabilities
                                                                    .MMS
                                                                    ? 'MMS,'
                                                                    : ''}
                                                                {phoneNum
                                                                    .capabilities
                                                                    .SMS
                                                                    ? 'SMS,'
                                                                    : ''}
                                                                {phoneNum
                                                                    .capabilities
                                                                    .voice
                                                                    ? 'VOICE'
                                                                    : ''}
                                                            </Td>
                                                            <Td>
                                                                {!isPurchased && (
                                                                    <Button
                                                                        size="sm"
                                                                        className="ltr:mr-3 rtl:ml-3 bg-red"
                                                                        type="button"
                                                                        variant="solid"
                                                                        color="cyan-500"
                                                                        onClick={(
                                                                            e,
                                                                        ) =>
                                                                            buyPhoneNumber(
                                                                                phoneNum,
                                                                            )
                                                                        }
                                                                    >
                                                                        Buy
                                                                    </Button>
                                                                )}
                                                                {isPurchased && (
                                                                    <Button
                                                                        loading={
                                                                            isLoading
                                                                        }
                                                                        size="sm"
                                                                        className="ltr:mr-3 rtl:ml-3 bg-red"
                                                                        type="button"
                                                                        variant="solid"
                                                                        color="red-500"
                                                                        onClick={() => {
                                                                            setPhoneNumToDelete(
                                                                                phoneNum,
                                                                            )
                                                                            setIsConfirmOpen(
                                                                                true,
                                                                            )
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                )}
                                                            </Td>
                                                        </Tr>
                                                    ),
                                                )}
                                            </>
                                        )}
                                </TBody>
                            </Table>
                            {phoneNumbers.length === 0 && (
                                <div className="text-center mt-5">
                                    There's no number to be displayed or
                                    available
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>

                <ConfirmDialog
                    isOpen={isConfirmOpen}
                    type="danger"
                    title="Delete Phone Number"
                    confirmButtonColor="red-600"
                    onClose={hanldeConfirmClose}
                    onRequestClose={hanldeConfirmClose}
                    onCancel={hanldeConfirmClose}
                    onConfirm={() => deletePhoneNumber(phoneNumToDelete)}
                >
                    <p>Are you sure you want to delete this phone number?</p>
                </ConfirmDialog>
            </Loading>
        </Container>
    )
}

export default CallSettingForm
