import AdaptableCard from '@/components/shared/AdaptableCard'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import { Field, FormikErrors, FormikTouched, FieldProps } from 'formik'

type FormFieldsName = {
    name: string
    organizationName: string
    description: string
    twilioNumber: string
}

type BasicInformationFields = {
    touched: FormikTouched<FormFieldsName>
    errors: FormikErrors<FormFieldsName>
}

const BasicInformationFields = (props: BasicInformationFields) => {
    const { touched, errors } = props

    return (
        <AdaptableCard divider className="mb-4">
            <h5>Agent Information</h5>
            <p className="mb-6"></p>
            <FormItem
                label="Agent Name"
                invalid={(errors.name && touched.name) as boolean}
                errorMessage={errors.name}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="name"
                    placeholder="Agent Name"
                    component={Input}
                    
                />
            </FormItem>
            <FormItem
                label="Organization Name"
                invalid={(errors.organizationName && touched.organizationName) as boolean}
                errorMessage={errors.organizationName}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="organizationName"
                    placeholder="Organization Name"
                    component={Input}
                />
            </FormItem>
            <FormItem
                label="Description"
                invalid={(errors.description && touched.description) as boolean}
                errorMessage={errors.description}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="description"
                    placeholder="description"
                    component={Input}
                />
            </FormItem>
            {/* <FormItem
                label="TwilioNumber"
                invalid={(errors.twilioNumber && touched.twilioNumber) as boolean}
                errorMessage={errors.twilioNumber}
            >
                <Field
                    type="text"
                    autoComplete="off"
                    name="twilioNumber"
                    placeholder="Please enter your Twilio Phone number"
                    component={Input}
                />
            </FormItem> */}
        </AdaptableCard>
    )
}

export default BasicInformationFields
