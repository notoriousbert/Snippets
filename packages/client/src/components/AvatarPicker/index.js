import React, { useEffect } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import { useState } from "react";

export default function AvatarPicker(props) {
  const [pickedAvatar, setPickedAvatar] = useState("/bird.svg");

  const imageClassWithBorder = "img-fluid m-2 p-3 border border-primary rounded mb-0";
  const imageClassNoBorder = "img-fluid m-2 p-3";

  useEffect(() => {
    props.setProfileImage("/bird.svg")
  }, [])

  let imgs = [
    "/bird.svg",
    "/dog.svg",
    "/fox.svg",
    "/frog.svg",
    "/lion.svg",
    "/owl.svg",
    "/tiger.svg",
    "/whale.svg",
  ];
  

  const avatarSelector = (event) => {
    setPickedAvatar(event.target.name);
    props.setProfileImage(event.target.name)
    if (props.state) {
      props.state.user.profile_image = pickedAvatar
    }
  };

  const displayChoosableAvatar = () => {
    let bootstrapImgs = [];
    imgs.forEach((img, index) => {
      bootstrapImgs.push(
        <div>
          <Image
            onClick={avatarSelector}
            className={
              pickedAvatar === img ? imageClassWithBorder : imageClassNoBorder
            }
            src={img}
            key={index}
            rounded
            name={img}
            style={{ maxWidth: '7rem' }}
          />
        </div>
      );
    });
    let rows = [];
    for (let i = 0; i < bootstrapImgs.length; i += 3) {
      rows.push(bootstrapImgs.slice(i, i + 3));
    }

    const bootstrapFormattedRow = rows.map((row, index) => {
      let finalRow = [];

      row.forEach((image) => {
        index === 2 ? 
        finalRow.push(
          <Col className="m-md-0 pb-1 mb-1" xs={6} md={4}>
            {image}
          </Col>
        ) : 
        finalRow.push(
          <Col className="m-md-0" xs={6} md={4}>
            {image}
          </Col>
        )
      });

      return finalRow;
    });
    return bootstrapFormattedRow.map((row, index) => {
      if (index === 2) {
        return <Row className="mb-0 pb-0">{row}</Row>
      } else { 
        return <Row>{row}</Row>
      }
  });
  };

  return (
    <div>
      <Container className="mt-3 mb-0 mx-auto flex">
        {displayChoosableAvatar()}
      </Container>
    </div>
  );
}
