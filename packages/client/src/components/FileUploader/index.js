import React from "react";
import Form from "react-bootstrap/Form";

export default function FileUploader({
  setFileName,
  setProfileImage,
  setProfilePicFromApp
}) {

  const handleChange = async (event) => {
    if (!event.target.files[0]) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setFileName(event.target.files[0]);
    setProfileImage(
      `/${event.target.files[0].name.replace(/[^a-zA-Z0-9]/g, "-")}`
    );
  };

  return (
    <Form.Group variant="outline-primary">
      <Form.File.Label className="mb-3"></Form.File.Label>
      <Form.File
        type="file"
        required
        name="userUpload"
        onChange={handleChange}
        accept="image/*"
        id="validationFormik107"
      />
    </Form.Group>
  );
}
