import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import CheckoutSteps from '../components/CheckoutSteps';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';

export default function PaymentMethodScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingAddressObj, paymentMethodObj },
  } = state;

  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethodObj || 'PayPal'
  );
  const [toRedirectToPlaceOrder, setToRedirectToPlaceOrder] = useState(false);

  useEffect(() => {
    if (!shippingAddressObj.shippingAddress) {
      navigate('/shipping');
    }
  }, [navigate, shippingAddressObj]);

  const submitHandler = (e) => {
    e.preventDefault();

    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
    localStorage.setItem('paymentMethodObj', paymentMethodName);
    setToRedirectToPlaceOrder(true);
  };

  useEffect(() => {
    if (toRedirectToPlaceOrder) navigate('/placeorder');
  });
  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container">
        <Helmet>
          <title>Payment Method</title>
        </Helmet>
        <h1 className="my-3">Payment Method</h1>
        <Form onSubmit={submitHandler}>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="PayPal"
              label="PayPal"
              value="PayPal"
              checked={paymentMethodName === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="Cash"
              label="Cash"
              value="Cash"
              checked={paymentMethodName === 'Cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
          <Button variant="primary" type="submit">
            Continue
          </Button>
        </Form>
      </div>
    </div>
  );
}
