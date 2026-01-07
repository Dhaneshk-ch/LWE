import "../styles/SuggestionBox.css";

export default function SuggestionBox({ emotion, suggestion }) {
  return (
    <div className="suggestion-box">
      <h4>Emotion Detected</h4>
      <p className="emotion">{emotion}</p>
      <p className="suggestion">{suggestion}</p>
    </div>
  );
}
