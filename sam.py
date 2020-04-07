import sys
import json


def solve(n, arr):
    return 'aksh'


if __name__ == "__main__":

    myJson = '{"n":3,"arr":[1,2,3]}'
    loadedDict = json.loads(myJson)
    print(solve(**loadedDict))
