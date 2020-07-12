import React from 'react';
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        height: 300
    }
});

function valuetext(value) {
    return `${value}`;
}

const marks = [
    {
        value: 0,
        label: '0'
    },
    {
        value: 1,
        label: '1'
    },
    {
        value: 2,
        label: '2'
    },
    {
        value: 3,
        label: '3'
    },
    {
        value: 4,
        label: '4'
    },
    {
        value: 5,
        label: '5'
    },
    {
        value: 6,
        label: '6'
    },
    {
        value: 7,
        label: '7'
    },
    {
        value: 8,
        label: '8'
    },
    {
        value: 9,
        label: '9'
    },
    {
        value: 10,
        label: '10'
    }
];

const VerticalSlider = ({ onSetSlider }) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <div className={classes.root} style={{ marginTop: 50, marginBottom: 50 }}>
                <Slider
                    step={1}
                    orientation="vertical"
                    defaultValue={[5]}
                    aria-labelledby="vertical-slider"
                    getAriaValueText={valuetext}
                    onChange={(_, val) => {
                        onSetSlider(val[0]);
                    }}
                    marks={marks}
                    min={0}
                    max={10}
                />
            </div>
        </React.Fragment>
    );
};

export default VerticalSlider;
