#!/bin/sh


SCENARIO="collaboration_scoring_scenario4_multiple"
VIDEO="https://www.youtube.com/watch?v=nse01V6NJGA"

DATA="../data/access.csv"
RENDER="samples/$SCENARIO.html"


cat prelude.html > $RENDER

function debug {
    echo //DEBUG: "$@"
}

for U in `cut -d , -f 3 $DATA | sort | grep hangout  | uniq`
do
    # echo $U
    unset CURR
    unset PREV
    unset SPREAD_START
    SPREAD=0
    # Ignore volume scores unless no sound recorded
    TIMES=`grep ",$U," $DATA | grep -v ',0$' | cut -d , -f 1 | sort`
    # echo $TIMES

    unset TALKING

    debug CURR DIFF TALKING SPREAD_START SPREAD

    for T in $TIMES
    do
        CURR=$T

        # set the initial comparison
        if [ -z "$PREV" ]
        then
            PREV=$CURR
        fi

        DIFF=$((CURR - PREV))

        # check the user status
        debug $CURR $DIFF $TALKING $SPREAD_START $SPREAD
        if [ -n "$TALKING" ]
        then
            # the user is talking
            if [ $DIFF -gt 1000 ]
            then
                # The user stopped talking
                debug SPREAD_END $SPREAD_START $PREV \($SPREAD\)
                echo \[ \'$U\', new Date\($SPREAD_START\), new Date\($PREV\) \],
                SPREAD=0
                unset SPREAD_START
                unset TALKING
            else
                SPREAD=$((SPREAD + DIFF))
            fi
        else
            # we reset if too much of a gap
            if [ $DIFF -gt 500 ]
            then
                # ignore jitter in the events
                SPREAD=0
                unset SPREAD_START
                debug SPREAD_RESET SPREAD_START $SPREAD_START SPREAD $SPREAD
            else
                # we start accumulating again
                if [ -z "$SPREAD_START" ]
                then
                    SPREAD_START=$PREV
                    debug SPREAD_START $SPREAD_START
                fi

                SPREAD=$((SPREAD + DIFF))

                if [ $SPREAD -gt 500 ]
                then
                    TALKING=true
                    debug TALKING $TALKING SPREAD_START $SPREAD_START SPREAD $SPREAD
                fi
            fi

        fi


        PREV=$CURR

    done
done >> $RENDER

cat coda.html | sed -e s#VIDEO_URL#$VIDEO# >> $RENDER
open $RENDER
