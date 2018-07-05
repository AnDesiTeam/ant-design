import React from 'react';
import { render, mount } from 'enzyme';
import Table from '..';

describe('Table.filter', () => {
  const filterFn = (value, record) => record.name.indexOf(value) !== -1;
  const column = {
    title: 'Name',
    dataIndex: 'name',
    filters: [
      { text: 'Boy', value: 'boy' },
      { text: 'Girl', value: 'girl' },
      {
        text: 'Title',
        value: 'title',
        children: [
          { text: 'Designer', value: 'designer' },
          { text: 'Coder', value: 'coder' },
        ],
      },
    ],
    onFilter: filterFn,
  };

  const data = [
    { key: 0, name: 'Jack' },
    { key: 1, name: 'Lucy' },
    { key: 2, name: 'Tom' },
    { key: 3, name: 'Jerry' },
  ];

  function createTable(props) {
    return (
      <Table
        columns={[column]}
        dataSource={data}
        pagination={false}
        {...props}
      />
    );
  }

  function renderedNames(wrapper) {
    return wrapper.find('TableRow').map(row => row.props().record.name);
  }

  it('renders filter correctly', () => {
    const wrapper = render(createTable());

    expect(wrapper).toMatchSnapshot();
  });

  it('renders menu correctly', () => {
    const wrapper = mount(createTable());
    const dropdownWrapper = render(wrapper.find('Trigger').instance().getComponent());
    expect(dropdownWrapper).toMatchSnapshot();
  });

  it('renders radio filter correctly', () => {
    const wrapper = mount(createTable({
      columns: [{
        ...column,
        filterMultiple: false,
      }],
    }));
    const dropdownWrapper = render(wrapper.find('Trigger').instance().getComponent());
    expect(dropdownWrapper).toMatchSnapshot();
  });

  it('renders custom content correctly', () => {
    const filter = (
      <div className="custom-filter-dropdown">
        custom filter
      </div>
    );
    const wrapper = mount(createTable({
      columns: [{
        ...column,
        filterDropdown: filter,
      }],
    }));

    const dropdownWrapper = render(wrapper.find('Trigger').instance().getComponent());
    expect(dropdownWrapper).toMatchSnapshot();
  });

  it('can be controlled by filterDropdownVisible', () => {
    const wrapper = mount(createTable({
      columns: [{
        ...column,
        filterDropdownVisible: true,
      }],
    }));

    let dropdown = wrapper.find('Dropdown').first();
    expect(dropdown.props().visible).toBe(true);

    wrapper.setProps({
      columns: [{
        ...column,
        filterDropdownVisible: false,
      }],
    });

    dropdown = wrapper.find('Dropdown').first();
    expect(dropdown.props().visible).toBe(false);
  });

  it('if the filter is visible it should ignore the selectedKeys changes', () => {
    const wrapper = mount(createTable({
      columns: [{
        ...column,
        filterDropdownVisible: true,
      }],
    }));

    const filterMenu = wrapper.find('FilterMenu').instance();
    expect(filterMenu.state.selectedKeys).toEqual([]);
    wrapper.find('FilterMenu').find('input[type="checkbox"]').first().simulate('click');
    expect(filterMenu.state.selectedKeys).toEqual(['boy']);
    wrapper.setProps({ dataSource: [...data, { key: 999, name: 'Chris' }] });
    expect(filterMenu.state.selectedKeys).toEqual(['boy']);
  });

  it('fires change event when visible change', () => {
    const handleChange = jest.fn();
    const wrapper = mount(createTable({
      columns: [{
        ...column,
        onFilterDropdownVisibleChange: handleChange,
      }],
    }));

    wrapper.find('.ant-dropdown-trigger').first().simulate('click');

    expect(handleChange).toBeCalledWith(true);
  });

  it('can be controlled by filteredValue', () => {
    const wrapper = mount(createTable({
      columns: [{
        ...column,
        filteredValue: ['Lucy'],
      }],
    }));

    expect(wrapper.find('tbody tr').length).toBe(1);
    wrapper.setProps({
      columns: [{
        ...column,
        filteredValue: [],
      }],
    });
    expect(wrapper.find('tbody tr').length).toBe(4);
  });

  it('can be controlled by filteredValue null', () => {
    const wrapper = mount(createTable({
      columns: [{
        ...column,
        filteredValue: ['Lucy'],
      }],
    }));

    expect(wrapper.find('tbody tr').length).toBe(1);
    wrapper.setProps({
      columns: [{
        ...column,
        filteredValue: null,
      }],
    });
    expect(wrapper.find('tbody tr').length).toBe(4);
  });

  it('fires change event', () => {
    const handleChange = jest.fn();
    const wrapper = mount(createTable({ onChange: handleChange }));
    const dropdownWrapper = mount(wrapper.find('Trigger').instance().getComponent());

    dropdownWrapper.find('MenuItem').first().simulate('click');
    dropdownWrapper.find('.confirm').simulate('click');

    expect(handleChange).toBeCalledWith({}, { name: ['boy'] }, {});
  });

  it('should not fire change event on close filterDropdown without changing anything', () => {
    const handleChange = jest.fn();
    const wrapper = mount(createTable({ onChange: handleChange }));
    const dropdownWrapper = mount(wrapper.find('Trigger').instance().getComponent());

    dropdownWrapper.find('.clear').simulate('click');

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('three levels menu', () => {
    const filters = [
      { text: 'Upper', value: 'Upper' },
      { text: 'Lower', value: 'Lower' },
      {
        text: 'Level2',
        value: 'Level2',
        children: [
          { text: 'Large', value: 'Large' },
          { text: 'Small', value: 'Small' },
          {
            text: 'Level3',
            value: 'Level3',
            children: [
              { text: 'Black', value: 'Black' },
              { text: 'White', value: 'White' },
              { text: 'Jack', value: 'Jack' },
            ],
          },
        ],
      },
    ];
    const wrapper = mount(createTable({
      columns: [{
        ...column,
        filters,
      }],
    }));
    jest.useFakeTimers();
    const dropdownWrapper = mount(wrapper.find('Trigger').instance().getComponent());
    dropdownWrapper.find('.ant-dropdown-menu-submenu-title').at(0).simulate('mouseEnter');
    jest.runAllTimers();
    dropdownWrapper.update();
    dropdownWrapper.find('.ant-dropdown-menu-submenu-title').at(1).simulate('mouseEnter');
    jest.runAllTimers();
    dropdownWrapper.update();
    dropdownWrapper.find('MenuItem').last().simulate('click');
    dropdownWrapper.find('.confirm').simulate('click');
    wrapper.update();
    expect(renderedNames(wrapper)).toEqual(['Jack']);
    jest.useRealTimers();
  });

  it('works with JSX in controlled mode', () => {
    const { Column } = Table;

    class App extends React.Component {
      state = {
        filters: {},
      }

      handleChange = (pagination, filters) => {
        this.setState({ filters });
      }

      render() {
        const { filters } = this.state;
        return (
          <Table dataSource={data} onChange={this.handleChange}>
            <Column
              title="name"
              dataIndex="name"
              key="name"
              filters={[
                { text: 'Jack', value: 'Jack' },
                { text: 'Lucy', value: 'Lucy' },
              ]}
              filteredValue={filters.name}
              onFilter={filterFn}
            />
          </Table>
        );
      }
    }

    const wrapper = mount(<App />);
    const dropdownWrapper = mount(wrapper.find('Trigger').instance().getComponent());

    dropdownWrapper.find('MenuItem').first().simulate('click');
    dropdownWrapper.find('.confirm').simulate('click');
    wrapper.update();
    expect(renderedNames(wrapper)).toEqual(['Jack']);

    dropdownWrapper.find('.clear').simulate('click');
    wrapper.update();
    expect(renderedNames(wrapper)).toEqual(['Jack', 'Lucy', 'Tom', 'Jerry']);
  });

  it('works with grouping columns in controlled mode', () => {
    const columns = [
      {
        title: 'group',
        key: 'group',
        children: [
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filters: [
              { text: 'Jack', value: 'Jack' },
              { text: 'Lucy', value: 'Lucy' },
            ],
            onFilter: filterFn,
            filteredValue: ['Jack'],
          },
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
          },
        ],
      },
    ];
    const testData = [
      { key: 0, name: 'Jack', age: 11 },
      { key: 1, name: 'Lucy', age: 20 },
      { key: 2, name: 'Tom', age: 21 },
      { key: 3, name: 'Jerry', age: 22 },
    ];
    const wrapper = mount(
      <Table columns={columns} dataSource={testData} />
    );

    expect(renderedNames(wrapper)).toEqual(['Jack']);
  });

  it('confirm filter when dropdown hidden', () => {
    const handleChange = jest.fn();
    const wrapper = mount(createTable({
      columns: [{
        ...column,
        filters: [
          { text: 'Jack', value: 'Jack' },
          { text: 'Lucy', value: 'Lucy' },
        ],
      }],
      onChange: handleChange,
    }));

    wrapper.find('.ant-dropdown-trigger').first().simulate('click');
    wrapper.find('.ant-dropdown-menu-item').first().simulate('click');
    wrapper.find('.ant-dropdown-trigger').first().simulate('click');

    expect(handleChange).toBeCalled();
  });
});
