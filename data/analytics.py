"""
Contains functionality for analysis.
A large number of functions, and a class implementation.
"""

import csv
import math
import operator
import functools

import numpy as np
import scipy as sp
import scipy.stats as st
import matplotlib as mpl
import matplotlib.pyplot as plt


#Testing the data set as a whole. This gets some basic sanity checks finished.
def get_from_records(records, index):
    return [k[index] for k in records]

# Verification that all times are ints, and displaying the offending lines
# otherwise.


def by_participant(records):
    participant_ids = sorted(set([k[2] for k in records]))
    tot = []
    for participant in participant_ids:
        tot.append([record for record in records if record[2] == participant])
    return tot
#Now we can compare between hangouts.


def by_hangout(records):
    hangout_ids = set([k[1] for k in records])
    tot = []
    for hangout in hangout_ids:
        tot.append([record for record in records if record[1] == hangout])
    return tot


def get_records_in_range(rs, startTime, endTime):
    return [r for r in rs if int(r[0]) > startTime and int(r[0]) < endTime]


def longer(records, length=3000):
    """Records is just a list of events. Length is the desired length
    of a given slice. It defaults to 3 seconds."""
    assert isinstance(length, int) or isinstance(length, float)
    t0, tend = int(records[0][0]), int(records[-1][0])
    i, tlast = t0 + length, t0
    transformed_records = []
    while i < tend:
        current = get_records_in_range(records, tlast, i)
        if len(current) > 0:
            pre_stage = by_participant(current)
            mid_stage = map(lambda x: (x[0][0], x[0][1], x[0][2], sum(int(
                r[3]) for r in x)), pre_stage)
            end_stage = sorted(mid_stage, lambda x, y: (cmp(x[3], y[3])))[-1]
            if end_stage[3] != 0:
                transformed_records.append(end_stage)
        tlast, i = i, i+length
    return transformed_records


# Here we have the scoring functions.
def memoize(obj):
    """Taken from https://wiki.python.org/moin/PythonDecoratorLibrary."""
    cache = obj.cache = {}

    @functools.wraps(obj)
    def memoizer(*args, **kwargs):
        key = str(args) + str(kwargs)
        if key not in cache:
            cache[key] = obj(*args, **kwargs)
        return cache[key]
    return memoizer


@memoize
def get_fractions(records):
    x = filter(lambda x: (operator.gt(int(x[3]), 1)), records)
    counts = list(map(len, by_participant(x)))
    counts = [len(k) for k in by_participant(x)]
    return [float(count)/sum(counts) for count in counts]


@memoize
def h_index(records, power=2):
    """Returns the Herfindahl index of the fraction of time people spend
    talking at a minimum volume.
    power: the power to take every fraction to. Defaults to two, because that's
    what's used in the inverse participation ratio and the Herfindahl index.
    There is no a priori reason to privilege squares over other powers.
    """
    return sum(map(lambda x: (x**power), get_fractions(records)))


def n_h_index(records):
    """Returns the normalized Herfindahl index.
    Total equality returns 0. Total inequality returns 1. Most values
    will be intermediate.
    """
    n = len(records)
    return (h_index(records)-1.0/n)/(1-1.0/n)


def double_domination(records):
    # The advantage of this over the Herfindahl index is that it's
    # supported by the conversational literature.
    fractions = get_fractions(records)
    double_share = sum(sorted(fractions)[:2])
    return double_share


def crosstalk(records):
    x = filter(lambda x: (operator.gt(int(x[3]), 1)), records)
    crosstalk_count = 0
    for i, r in enumerate(records[1:]):  # Starts with the 2nd element.
        if not r[2] == records[i][2]:  # Compares second to first initially.
            crosstalk_count += 1  # Comparison is only ever speaker to speaker.
    return crosstalk_count/float(len(records) - 1)


def pause_count(records, min_pause, max_pause):  # The meaning of minVol
    # is still the minimum volume to count, but now it determines
    # exclusion not inclusion.
    silences = filter(lambda x: (operator.eq(0, int(x[3]))), records)
    time_diffs = [int(records[i][0]) - int(records[i-1][0]) for i in range(
        len(records))]
    return len(filter(lambda x: (operator.and_(
        operator.gt(x, min_pause),
        operator.lt(x, max_pause))),
        time_diffs))/float(len(records)-1)


def shannon_index(records):
    f = get_fractions(records)
    h = -1 * sum(map(lambda x: (operator.mul(math.ln(x), x)), f))
    return h/ln(len(f))


def track_changes(records, scoring_function, lookback=50, frequency=5):
    """Reports the changes in the scoring function of records over time.
    records =
    scoring_function =
    lookback = How far back the scoring function should look.
    frequency = 1/how often you want to record the value."""
    return [scoring_function(records[i-lookback:i]) for i, _ in list(
        enumerate(records))[::frequency] if i > lookback]
"""How to convert collaboration scores into predictions into
                    comparisons of scoring mechanisms:
0. Have a uniformish prior over range of collaboration scores.
                    Have prior for model effectiveness.
1. Find a relationship between score and metric, with probit model
                    (Were the aggregated scores in the top half?)
2. Spit out likelihood ratios relative to old prior?"""
"""Train a probit model taking in success and collaboration rating, see how it
 improves over P(success)=.5."""
"""Probit model: \sum\limits_{i=1}^n
        [Y_i-\phi (b_0 + b_1 X_1 + ... + b_k X_{ki})]^2"""


def probit(outcomes, records_list, mapping):
    # mapping should be a function that takes in a record and returns
    # the probability of output being 1.
    assert len(outcomes) == len(records_list)
    return sum((outcomes[i]-mapping(records_list[i]))**2 for i in range(
        len(outcomes)))


def AIC(records, SSR, p):
    """ln(SSR(p)/T + (p+1)2/T is the formula. The lower this is, the
        better the fit. This is the Akaike Information Criterion.
        I am using it because I don't think that any of the models
        accurately represents reality, so I am finding the one that
        fits best. """
    return math.ln(SSR(records, p)/math.ln(len(records)))+(p+1)*2/len(records)


class recording:
    """Functionality identical to functions present in this module,
    with identical names. For those who prefer to have objects.
    In a few places, object oriented functionality has been added."""
    def __init__(self, records):
        self.records = records
        self.times = set(map(int, self.get_from_records(0)))
        self.hangout_ids = set(self.get_from_records(1))
        self.participant_ids = set(self.get_from_records(2))  # Not an int.
        self.vols = list(map(int, self.get_from_records(3)))
        self.vol_range = set(vols)

    def pause_count(self, min_pause_length, max_pause_length):
        return pause_count(self.records, min_pause_length, max_pause_length)

    def crosstalk(self):
        return crosstalk(self.records)

    def track_changes(self, scoring_function, lookback=50, freq=5):
        return track_changes(self.records, scoring_function, lookback, freq)

    def double_domination(self):
        return double_domination(self.records)

    def h_index(self):
        return h_index(self.records)

    def n_h_index(self):
        return n_h_index(self.records)

    def get_fractions(self):
        return get_fractions(self.records)

    def longer(self, length=3000):
        return longer(self.records, length)

    def compress(self, length):
        self.records = self.longer(length)

    def by_participant(self):
        return by_participant(self.records)

    def by_hangout(self):
        return by_hangout(self.records)

    def get_records_in_range(self, start_time, end_time):
        return get_records_in_range(self.records, start_time, end_time)

    def get_from_records(self, index):
        return get_from_records(self.records, index)
