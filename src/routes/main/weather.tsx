import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { Component } from "solid-js";

const Weather: Component<{}> = (props) => {
  return (
    <MetaProvider>
      <Title>Caelus</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <div>Weather</div>;
    </MetaProvider>
  );
};

export default Weather;
