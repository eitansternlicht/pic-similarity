import React from 'react';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const marks = [
    {
        value: 0,
        label: '0'
    },
    {
        value: 10,
        label: '10'
    },
    {
        value: 20,
        label: '20'
    },
    {
        value: 30,
        label: '30'
    },
    {
        value: 40,
        label: '40'
    },
    {
        value: 50,
        label: '50'
    },
    {
        value: 60,
        label: '60'
    },
    {
        value: 70,
        label: '70'
    },
    {
        value: 80,
        label: '80'
    },
    {
        value: 90,
        label: '90'
    },
    {
        value: 100,
        label: '100'
    }
];
const useStyles = makeStyles({
    root: {
        width: 300
    }
});

const RangeSlider = ({ similarityAlgorithm, range, setRange }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Typography id="range-slider" gutterBottom>
                {similarityAlgorithm} Similarity range
            </Typography>
            <Slider
                step={10}
                value={range}
                onChange={(_, newRange) =>
                    newRange[0] !== range[0] || newRange[1] !== range[1] ? setRange(newRange) : null
                }
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={val => val}
                marks={marks}
                min={0}
                max={100}
            />
        </div>
    );
};

export default RangeSlider;
