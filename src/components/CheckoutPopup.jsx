import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, handleCheckout }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onConfirm = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setIsSubmitting(true);

    try {
      // delegate to parent (Cart) which will call placeOrder(...)
      await handleCheckout(name, email);
      // any success UI (toast, redirect, close modal) is handled in Cart
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertBase64ToDataURL = (base64String, mimeType = "image/jpeg") => {
    if (!base64String) return "https://via.placeholder.com/80?text=No+Image";

    if (base64String.startsWith("data:")) return base64String;
    if (base64String.startsWith("http")) return base64String;

    return `data:${mimeType};base64,${base64String}`;
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form noValidate validated={validated} onSubmit={onConfirm}>
        <Modal.Header closeButton>
          <Modal.Title>Checkout</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="checkout-items mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="d-flex mb-3 border-bottom pb-3">
                <img
                  src={convertBase64ToDataURL(item.imageData)}
                  alt={item.name}
                  className="me-3 rounded"
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1">{item.name}</h6>
                  <p className="mb-1 small">Quantity: {item.quantity}</p>
                  <p className="mb-0 small">
                    Price: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            <div className="text-center my-4">
              <h5 className="fw-bold">Total: ${totalPrice.toFixed(2)}</h5>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide your name.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid email address.
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Processing...
              </>
            ) : (
              "Confirm Purchase"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CheckoutPopup;
