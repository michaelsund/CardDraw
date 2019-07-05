import React, { useState } from 'react';

interface IProps {
  uri: string;
}

const CardDrawImage = (props: IProps) => {
  const [selected, setSelected] = useState<boolean>(false);
  return (
    <img
      style={{
        WebkitFilter: selected && 'brightness(50%)',
      }}
      onClick={() => setSelected(!selected)}
      src={props.uri}
      alt=""
    />
  );
};

export default CardDrawImage;
