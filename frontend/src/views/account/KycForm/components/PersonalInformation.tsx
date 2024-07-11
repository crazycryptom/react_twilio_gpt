import Input from '@/components/ui/Input'
import InputGroup from '@/components/ui/InputGroup'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import { countryList } from '@/constants/countries.constant'
import { components } from 'react-select'
import * as Yup from 'yup'
import type { OptionProps, SingleValueProps } from 'react-select'
import type { FieldInputProps, FieldProps, FormikProps } from 'formik'
import { forwardRef, type ComponentType } from 'react'
import type { InputProps } from '@/components/ui/Input'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { cloneDeep } from 'lodash'
import { Card } from '@/components/ui'

type FormikRef = FormikProps<any>

type CountryOption = {
    label: string
    dialCode: string
    value: string
}

type InitialData = {
    firstName?: string
    lastName?: string
    email?: string
    dialCode?: string
    phoneNumber?: string
    country?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    zipCode?: string
}
export type FormModel = Omit<InitialData, 'tags'> & {
    tags: { label: string; value: string }[] | string[]
}

export type SetSubmitting = (isSubmitting: boolean) => void

type PersonForm = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void
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
    firstName: Yup.string().required('First Name Required'),
    lastName: Yup.string().required('Last Name Required'),
    phoneNumber: Yup.string().required('Please enter your phone number'),
    dialCode: Yup.string().required('Please select dial code'),
})

const PersonalInformation = forwardRef<FormikRef, PersonForm>((props, ref) => {
    const { type, initialData, onFormSubmit } = props
    const [message, setMessage] = useTimeOutMessage()
    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        dialCode: '',
        phoneNumber: '',
        country: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        tags: [],
    }

    return (
        <>
            <div className="mb-4">
                <h3 className="mb-2">Personal Information</h3>
                <p>Basic information for an account</p>
            </div>
            <Card className="h-full" bodyClass="h-full">
                <Formik
                    innerRef={ref}
                    initialValues={{
                        ...initialValues,
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
                                <div className="md:grid grid-cols-2 gap-4">
                                    <FormItem
                                        label="First Name"
                                        invalid={
                                            (errors.firstName &&
                                                touched.firstName) as boolean
                                        }
                                        errorMessage={
                                            errors.firstName as string
                                        }
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="firstName"
                                            placeholder="First Name"
                                            component={Input}
                                        />
                                    </FormItem>
                                    {/* <div className="border rounded h-11">wefwef</div> */}
                                    <FormItem
                                        label="Last Name"
                                        invalid={
                                            (errors.lastName &&
                                                touched.lastName) as boolean
                                        }
                                        errorMessage={errors.lastName as string}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="lastName"
                                            placeholder="Last Name"
                                            component={Input}
                                        />
                                    </FormItem>
                                </div>
                                <div className="md:grid grid-cols-2 gap-4">
                                    <FormItem label="Email">
                                        <Field
                                            type="email"
                                            autoComplete="off"
                                            name="email"
                                            placeholder="Email"
                                            component={Input}
                                            disabled
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="Phone Number"
                                        invalid={
                                            ((errors.dialCode &&
                                                touched.dialCode) ||
                                                (errors.phoneNumber &&
                                                    touched.phoneNumber)) as boolean
                                        }
                                        errorMessage={
                                            errors.phoneNumber as string
                                        }
                                    >
                                        <InputGroup>
                                            <Field name="dialCode">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => (
                                                    <Select<CountryOption>
                                                        className="min-w-[130px]"
                                                        placeholder=""
                                                        components={{
                                                            Option: PhoneSelectOption,
                                                            SingleValue:
                                                                PhoneControl,
                                                        }}
                                                        field={field}
                                                        form={form}
                                                        options={countryList}
                                                        value={countryList.filter(
                                                            (country) =>
                                                                country.dialCode ===
                                                                values.dialCode,
                                                        )}
                                                        onChange={(country) =>
                                                            form.setFieldValue(
                                                                field.name,
                                                                country?.dialCode,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </Field>
                                            <Field name="phoneNumber">
                                                {({
                                                    field,
                                                    form,
                                                }: FieldProps) => {
                                                    return (
                                                        <NumericFormatInput
                                                            form={form}
                                                            field={field}
                                                            customInput={
                                                                NumberInput as ComponentType
                                                            }
                                                            placeholder="Phone Number"
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
                                        </InputGroup>
                                    </FormItem>
                                </div>
                                <div className="md:grid grid-cols-2 gap-4">
                                    <FormItem label="Country">
                                        <Field name="country">
                                            {({ field, form }: FieldProps) => (
                                                <Select
                                                    placeholder="Country"
                                                    field={field}
                                                    form={form}
                                                    options={countryList}
                                                    value={countryList.filter(
                                                        (c) =>
                                                            c.value ===
                                                            values.country,
                                                    )}
                                                    onChange={(c) =>
                                                        form.setFieldValue(
                                                            field.name,
                                                            c?.value,
                                                        )
                                                    }
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem label="State">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="state"
                                            placeholder="State"
                                            component={Input}
                                        />
                                    </FormItem>
                                </div>
                                <div className="md:grid grid-cols-2 gap-4">
                                    <FormItem label="City">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="city"
                                            placeholder="City"
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="Zip Code">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="zipCode"
                                            placeholder="Zip Code"
                                            component={Input}
                                        />
                                    </FormItem>
                                </div>
                                <div className="md:grid grid-cols-2 gap-4">
                                    <FormItem label="Address Line 1">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="addressLine1"
                                            placeholder="Address Line 1"
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="Address Line 2">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="addressLine2"
                                            placeholder="Address Line 2"
                                            component={Input}
                                        />
                                    </FormItem>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        loading={isSubmitting}
                                        variant="solid"
                                        type="submit"
                                    >
                                        Save
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </Card>
        </>
    )
})

export default PersonalInformation
