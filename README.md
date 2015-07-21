# collaboration-scoring

The sample data for the scenarios can be viewed wih 

    cd data
    ipython notebook analytics-notebook.ipynb

We will cover the following scenarios: 

1. A single person talking with pauses
2. Two people talking with discrete pauses between people 
3. Two people overtalking 
4. Live group - gwvft75j4edv4recs274ms4r5aa

# Logging 

The widget logs to a logger running on a single local machine.  Start
the logger with 

    brick
    
# Post-processing 

An example of the cleanup required to translate Apache logs to CSV:

    S=gwvft75j4edv4recs274ms4r5aa
    echo time,hangout_id,participant_id,volume >> $S.log
    grep ^1 access_log_1436821323 | sed -e 's#.*_.gif?##' -e 's#
    HTTP/1.1" 200 -##' -e "s#,1,#,$S,#"

# Team 

- @dazzagi
- @kellerscholl
- @jwalsh
