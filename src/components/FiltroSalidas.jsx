import React from 'react';
import { Input, DatePicker, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const FiltroSalidas = ({ searchText, setSearchText, selectedDates, setSelectedDates, onSearch }) => {
    const handleInputChange = (e) => {
        const value = e.target.value;
        



        onSearch(value, selectedDates);


    };

    const handleDateChange = (dates) => {
        setSelectedDates(dates);
        onSearch(searchText, dates);
    };

    return (
        <Space>
            <Input
                placeholder="Buscar por código o nombre del producto"
                prefix={<SearchOutlined />}
                value={searchText}
                onPressEnter={handleInputChange}
                onChange={(e)=> setSearchText(e.target.value)}
                allowClear
                style={{ width: 300 }}
            />

            <RangePicker
                value={selectedDates}
                onChange={handleDateChange}
                style={{ width: 260 }}
            />
        </Space>
    );
};

export default FiltroSalidas;
