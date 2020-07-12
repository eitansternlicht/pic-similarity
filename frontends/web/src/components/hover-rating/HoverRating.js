import React, { useState } from 'react';

import Box from '@material-ui/core/Box';
import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';

const labels = {
    0.5: 'Useless',
    1: 'Useless+',
    1.5: 'Poor',
    2: 'Poor+',
    2.5: 'Ok',
    3: 'Ok+',
    3.5: 'Good',
    4: 'Good+',
    4.5: 'Excellent',
    5: 'Excellent+'
};

const useStyles = makeStyles({
    root: {
        width: 200,
        display: 'flex',
        alignItems: 'center'
    }
});

const HoverRating = ({ rating, setRating, ratingName }) => {
    const [hover, setHover] = React.useState(-1);
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Rating
                name={ratingName}
                value={rating}
                precision={0.5}
                onChange={(_, newValue) => {
                    setRating(newValue);
                }}
                onChangeActive={(_, newHover) => {
                    setHover(newHover);
                }}
            />
            {rating !== null && <Box ml={2}>{labels[hover !== -1 ? hover : rating]}</Box>}
        </div>
    );
};

export default HoverRating;
