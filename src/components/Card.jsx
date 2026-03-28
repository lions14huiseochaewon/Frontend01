const Card = ({ title, children }) => {
  return (
    <div
      style={{
        width: "320px",
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        margin: "16px",
        border: "1px solid #ccc",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "12px" }}>{title}</h3>
      <p style={{ margin: "8px 0" }}>Card</p>
      <div>{children}</div>
    </div>
  );
};

export default Card;
