import React from 'react';
import { Button, Popover } from 'antd';

const style: React.CSSProperties = {
  width: '300vw',
  height: '300vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const App: React.FC = () => {
  const [clientReady, setClientReady] = React.useState<boolean>(false);
  React.useEffect(() => {
    document.documentElement.scrollTop = document.documentElement.clientHeight;
    document.documentElement.scrollLeft = document.documentElement.clientWidth;
    setClientReady(true);
    return () => setClientReady(false);
  }, []);
  return (
    <div style={style}>
      <Popover content="Thanks for using antd. Have a nice day !" open={clientReady}>
        <Button type="primary">Scroll The Window</Button>
      </Popover>
    </div>
  );
};

export default App;
