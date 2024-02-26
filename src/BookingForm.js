import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Select from 'react-select';
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file


// Load background images
import image1 from './images/pexels-1.jpg';
import image2 from './images/pexels-2.jpg';
import image3 from './images/pexels-3.jpg';
import image4 from './images/pexels-4.jpg';

// Background images for different steps
const stepContent = [
    {
        heading: 'Welcome to Your Adventure',
        text: 'Start planning your dream trip with us.',
        background: image1,
    },
    {
        heading: 'Customize Your Destination',
        text: 'Select your dream destination and travel dates.',
        background: image2,
    },
    {
        heading: 'Choose Your Comfort',
        text: 'Select your preferred hotel ratings and room type.',
        background: image3,
    },
    {
        heading: 'Payment Information',
        text: 'Securely enter your payment details to book your trip.',
        background: image4,
    },
];

// Destination options
const destinationOptions = [
    { value: 'ny', label: 'New York, USA' },
    { value: 'ldn', label: 'London, UK' },
    { value: 'tky', label: 'Tokyo, Japan' },
    { value: 'par', label: 'Paris, France' },
    { value: 'rom', label: 'Rome, Italy' },
    { value: 'ber', label: 'Berlin, Germany' },
    { value: 'mad', label: 'Madrid, Spain' },
    { value: 'syd', label: 'Sydney, Australia' },
    { value: 'cpt', label: 'Cape Town, South Africa' },
    { value: 'bkk', label: 'Bangkok, Thailand' },
    { value: 'kyo', label: 'Kyoto, Japan' },
    { value: 'ist', label: 'Istanbul, Turkey' },
    { value: 'rio', label: 'Rio de Janeiro, Brazil' },
    { value: 'mex', label: 'Mexico City, Mexico' },
    { value: 'ams', label: 'Amsterdam, Netherlands' },
    { value: 'ath', label: 'Athens, Greece' },
    { value: 'bej', label: 'Beijing, China' },
    { value: 'mos', label: 'Moscow, Russia' },
    { value: 'mum', label: 'Mumbai, India' },
    { value: 'cai', label: 'Cairo, Egypt' },
];

// Type of room options
const typeOfRoomOptions = [
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'twin', label: 'Twin' },
    { value: 'suite', label: 'Suite' },
    { value: 'penthouse', label: 'Penthouse' },
];


// Define a validation schema for each step
const schema = [
    yup.object({
        firstname: yup.string().required('Firstname is required').matches(/^[A-Za-z -]*$/, 'Only alphabets are allowed'),
        surname: yup.string().required('Surname is required').matches(/^[A-Za-z -]*$/, 'Only alphabets are allowed'),
        email: yup.string().email('Invalid email format').required('Email is required'),
        phoneNumber: yup.string().required('Phone Number is required').matches(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
        numberOfTravelers: yup.number().required('Number of Travelers is required').positive().integer(),
        numberOfChildren: yup.number().min(0, 'Number of Children cannot be negative').integer(),
    }),
    yup.object({
        // Adjustments for the second step to accommodate date range
        destination: yup.string().required('Destination is required'),
        dateRange: yup.object().shape({
            startDate: yup.date().required('Departure Date is required').min(new Date(), 'Departure date cannot be in the past'),
            endDate: yup.date().required('Return Date is required').min(yup.ref('startDate'), 'Return date cannot be before the departure date'),
        }).required('Date range is required'),
    }),
    yup.object({
        hotelStarRating: yup.number().required('Hotel Star Rating is required').min(1).max(5),
        typeOfRoom: yup.string().required('Type of Room is required'),
        specialRequests: yup.string(),
    }),
    yup.object({
        cardholderName: yup.string().required('Cardholder Name is required'),
        cardNumber: yup.string().required('Card Number is required').matches(/^[0-9]{16}$/, 'Invalid Card Number'),
        expiryDate: yup.string().required('Expiry Date is required').test('is-valid-date', 'Expiry date cannot be in the past', value => {
            const today = new Date();
            const month = today.getMonth() + 1; // getMonth() is zero-based
            const year = today.getFullYear();
            const [expYear, expMonth] = value.split('-').map(Number);
            return expYear > year || (expYear === year && expMonth >= month);
        }),
        cvv: yup.string().required('CVV is required').matches(/^[0-9]{3}$/, 'Invalid CVV'),
    }),
];

export default function BookingForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: addDays(new Date(), 1), key: 'selection' }]);

    useEffect(() => {
        document.body.style.backgroundImage = `url(${stepContent[currentStep].background})`;
    }, [currentStep]);

    const transitionDuration = 300; // Transition duration in milliseconds

    const changeStep = (stepIncrement) => {
        setIsExiting(true);

        // Wait for the exit transition to complete before changing the step
        setTimeout(() => {
            setCurrentStep((prevStep) => prevStep + stepIncrement);

            // Reset the isExiting state after the enter transition duration
            setTimeout(() => {
                setIsExiting(false);
            }, transitionDuration);
        }, transitionDuration);
    };


    // Apply the transition classes based on the isExiting state
    const stepClass = isExiting ? 'step-exit' : 'step-enter';


    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setValue,
    } = useForm({
        resolver: yupResolver(schema[currentStep]),
    });

    useEffect(() => {
        // Register the dateRange field
        register("dateRange");
    }, [register]);

    const nextStep = (data) => {
        const newFormValues = { ...formValues, ...data };
        setFormValues(newFormValues);
        if (currentStep < schema.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            console.log(newFormValues);
            reset();
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSelect = (ranges) => {
        setDateRange([ranges.selection]);
        setValue("dateRange", ranges.selection);
    };

    const onSubmit = (data) => nextStep(data);

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <div className='InlineSplit'>
                        <div className='FormInput'>
                            <label>First Name</label>
                            <input {...register("firstname")} autoComplete='name' />
                            <p className="FieldError">{errors.firstname?.message}</p>
                        </div>

                        <div className='FormInput'>
                            <label>Surname</label>
                            <input {...register("surname")} autoComplete='name' />
                            <p className="FieldError">{errors.surname?.message}</p>
                        </div>
                        </div>

                        <div className='FormInput'>
                            <label>Email</label>
                            <input {...register("email")} type="email" autoComplete='email' />
                            <p className="FieldError">{errors.email?.message}</p>
                        </div>

                        <div className='FormInput'>
                            <label>Phone Number</label>
                            <input {...register("phoneNumber")} autoComplete='tel' />
                            <p className="FieldError">{errors.phoneNumber?.message}</p>
                        </div>


                        <div className='InlineSplit'>
                            <div className='FormInput'>
                                <label>Number of Travelers</label>
                                <input {...register("numberOfTravelers")} type="number" min={0} value={1} />
                                <p className="FieldError">{errors.numberOfTravelers?.message}</p>
                            </div>

                            <div className='FormInput'>
                                <label>Number of Children</label>
                                <input {...register("numberOfChildren")} type="number" min={0} value={0} />
                                <p className="FieldError">{errors.numberOfChildren?.message}</p>
                            </div>
                        </div>
                    </>
                );
            case 1:
                return (
                    <>
                        <div className='FormInput'>
                            <label>Destination</label>
                            <Controller
                                name="destination"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        value={destinationOptions.find(option => option.value === field.value)} // Ensure the select shows the correct selected option
                                        options={destinationOptions}
                                        onChange={(option) => field.onChange(option.value)} // Pass only the value to the form
                                    />
                                )}
                            />
                            <p className="FieldError">{errors.destination?.message}</p>
                        </div>

                        <div className='FormInput datePicker'>
                            <label>Date Range</label>
                            <Controller
                                name="dateRange"
                                control={control}
                                render={() => (
                                    <DateRangePicker
                                        ranges={dateRange}
                                        onChange={handleSelect}
                                        minDate={new Date()}
                                        rangeColors={["#9dbfa5"]}
                                    />
                                )}
                            />
                            <p className="FieldError">{errors.dateRange?.startDate?.message || errors.dateRange?.endDate?.message}</p>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <div className='FormInput'>
                            <label>Hotel Star Rating</label>
                            <select {...register("hotelStarRating")}>
                                <option value="">Select...</option>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <option key={star} value={star}>{`${star} Star${star > 1 ? 's' : ''}`}</option>
                                ))}
                            </select>
                            <p className="FieldError">{errors.hotelStarRating?.message}</p>
                        </div>

                        <div className='FormInput'>
                            <label>Type of Room</label>
                            <Controller
                                name="typeOfRoom"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        value={typeOfRoomOptions.find(option => option.value === field.value)} // Ensure the select shows the correct selected option
                                        options={typeOfRoomOptions}
                                        onChange={(option) => field.onChange(option.value)} // Pass only the value to the form
                                    />
                                )}
                            />
                            <p className="FieldError">{errors.typeOfRoom?.message}</p>
                        </div>

                        <div className='FormInput'>
                            <label>Special Requests</label>
                            <textarea {...register("specialRequests")} />
                            <p className="FieldError">{errors.specialRequests?.message}</p>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <div className='FormInput'>
                            <label>Cardholder Name</label>
                            <input {...register("cardholderName")} />
                            <p className="FieldError">{errors.cardholderName?.message}</p>
                        </div>

                        <div className='FormInput'>
                            <label>Card Number</label>
                            <input {...register("cardNumber")} />
                            <p className="FieldError">{errors.cardNumber?.message}</p>
                        </div>

                        <div className='FormInput'>
                            <label>Expiry Date</label>
                            <input {...register("expiryDate")} type="month" />
                            <p className="FieldError">{errors.expiryDate?.message}</p>
                        </div>

                        <div className='FormInput'>
                            <label>CVV</label>
                            <input {...register("cvv")} />
                            <p className="FieldError">{errors.cvv?.message}</p>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`form-container step-content ${stepClass === 'entering' ? 'enter' : ''} form-step ${stepClass} current-step-${currentStep}`}
            style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'space-around' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="form-section">
                {renderStep()}
                <div className='ProgressButtons'>
                    {currentStep > 0 && (
                        <button type="button" onClick={prevStep} className='stepButton'>
                            Previous
                        </button>
                    )}
                    <button type="submit" className='stepButton'>{currentStep === schema.length - 1 ? 'Submit' : 'Next'}</button>
                </div>
            </form>
            <div className="info-section">
                <h1>{stepContent[currentStep].heading}</h1>
                <p>{stepContent[currentStep].text}</p>
            </div>
        </div>
    );

}
