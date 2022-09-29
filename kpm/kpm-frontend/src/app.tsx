import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

class Menu extends React.Component {
  render() {
    return (
      <h1>We are all KPM!</h1>
    )
  }
}

const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(<Menu />);