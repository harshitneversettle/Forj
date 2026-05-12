const Demo = ({
  src = "https://www.loom.com/embed/17495acb8afc47ae8ca3636aaad23e96",
}) => (
  <div style={{ position: "relative", paddingBottom: "62.5%", height: 0 }}>
    <iframe
      src={src}
      frameBorder="0"
      allowFullScreen
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  </div>
);

export default Demo;
