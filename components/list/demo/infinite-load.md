---
order: 0
title:
  zh-CN: 无限加载
  en-US: infinite load
---

## zh-CN

无限加载样例。

## en-US

The example of infinite load.

````jsx
import { List, Card, message } from 'antd';

function mockData() {
  const data = [];
  for (let i = 0; i < 5; i++) {
    const id = Math.floor(Math.random() * 10000);
    data.push({
      id: `id-${id}`,
      title: `List Item Title ${id}`,
      content: `List Item Content ${id}`,
    });
  }
  return data;
}

class InfiniteList extends React.Component {
  state = {
    data: mockData(),
    loading: false,
  }
  handleInfiniteOnLoad = (done) => {
    let data = this.state.data;
    if (data.length > 15) {
      message.warning('Loaded All');
      return;
    }
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      data = data.concat(mockData());
      this.setState({
        data,
        loading: false,
      });
      // reset the infinite onLoad callback flag
      // so can trigger onLoad callback again
      done();
    }, 1000);
  }
  render() {
    return (
      <List
        infinite={{
          loading: this.state.loading,
          onLoad: this.handleInfiniteOnLoad,
          offset: -20,
        }}
        grid={{ gutter: 16, column: 4 }}
      >
        {
          this.state.data.map(item => (
            <List.Item key={item.id}>
              <Card title={item.title}>{item.content}</Card>
            </List.Item>
          ))
        }
      </List>
    );
  }
}

ReactDOM.render(<InfiniteList />, mountNode);
````
