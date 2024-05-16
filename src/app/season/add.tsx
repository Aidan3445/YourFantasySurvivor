"use client";

const castaways = [
    {
        _id: {
            $oid: "65d4b792bf50a72e5a95397d",
        },
        name: "Hunter McKnight",
        age: 28,
        hometown: "French Camp, MS",
        residence: "French Camp, MS",
        job: "Science Teacher",
        photo:
            "https://parade.com/.image/ar_3:2%2Cc_limit%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_700/MjA0MDY0MDk0OTAxOTA0ODkx/hunter-mcknight.jpg",
        interview:
            "https://parade.com/tv/survivor-46-cast#gid=ci02d5011c3000263c&pid=hunter-mcknight",
        season: "Survivor 46",
        "tribe": "Nami"
    },
];

// button that posts austin on click to api/addCastaway route
export function AddCastaway() {
    const postCastaway = async (castaway: any) => {
        try {
            const res = await fetch("/api/addCastaway", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(castaway),
            });

            if (!res.ok) {
                console.error("failed", res.statusText);
            }

            const data = await res.json();
            console.log("success", data);
        } catch (error) {
            console.error("Error on Post", error);
        }
    };

    return (
        <button onClick={() => castaways.forEach(async (c) => await postCastaway(c))}>
            Add
        </button>
    );
}

const episodes = [
    {
        "number": 1,
        "title": "We Can Do Hard Things",
        "airDate": "2023-09-27",
        "advsFound": [],
        "advPlaysSelf": [],
        "advPlaysOther": [],
        "badAdvPlays": [],
        "advsEliminated": [],
        "spokeEpTitle": [
            "Hannah Rose"
        ],
        "tribe1sts": [
            {
                "name": {
                    "name": "Reba"
                },
                "onModel": "Tribes"
            },
            {
                "name": {
                    "name": "Belo"
                },
                "onModel": "Tribes"
            }
        ],
        "tribe2nds": [
            {
                "name": {
                    "name": "Reba"
                },
                "onModel": "Tribes"
            }
        ],
        "indivWins": [],
        "indivRewards": [],
        "blindsides": [],
        "finalThree": [],
        "fireWins": [],
        "soleSurvivor": [],
        "eliminated": [
            "Hannah Rose"
        ],
        "quits": [],
        "tribeUpdates": [
            {
                "tribe": "Reba",
                "survivors": [
                    "Austin Li Coon",
                    "Drew Basile",
                    "J. Maya",
                    "Dee Valladares",
                    "Sifu Alsup",
                    "Julie Alley"
                ]
            },
            {
                "tribe": "Lulu",
                "survivors": [
                    "Hannah Rose",
                    "Sean Edwards",
                    "Emily Flippen",
                    "Brandon Donlon",
                    "Sabiyah Broderick",
                    "Kaleb Gebrewold"
                ]
            },
            {
                "tribe": "Belo",
                "survivors": [
                    "Jake O'Kane",
                    "Bruce Perreault",
                    "Brando Meyer",
                    "Katurah Topps",
                    "Kellie Nalbandian",
                    "Kendra McQuarrie"
                ]
            }
        ],
        "merged": false,
        "notes": [
            {
                "name": "Reba",
                "notes": [
                    "Reba won a challenge! (reward)",
                    "an epic close battle went back and forth!",
                    "Reba got seccond in a challenge! (immunity)"
                ],
                "onModel": "Tribes"
            },
            {
                "name": "Belo",
                "notes": [
                    "Belo won a challenge! (reward)",
                    "an epic close battle went back and forth!",
                    "Belo won a challenge! (immunity)",
                    "Held a lead through it all. nice job team"
                ],
                "onModel": "Tribes"
            },
            {
                "name": "Lulu",
                "notes": [
                    "Lulu won a challenge! (reward)",
                    "an epic close battle went back and forth!"
                ],
                "onModel": "Tribes"
            },
            {
                "name": "Kellie Nalbandian",
                "notes": [
                    "sucks"
                ],
                "onModel": "Survivors"
            },
            {
                "name": "Hannah Rose",
                "notes": [
                    "Eliminated!",
                    "Votes against: Kaleb Gebrewold, Sabiyah Broderick, Sean Edwards, Brandon Donlon, Emily Flippen",
                    "Spoke episode title!",
                    "QUITTTT?????"
                ],
                "onModel": "Survivors"
            }
        ]
    },
];

function tribesToCastaways(t: any[]): any[] {
    var output: any[] = [];
    t.forEach(async (tribe) => {
        if (tribe.onModel === "Tribes") {
            try {
                const tribeMembers = await fetch(`/api/castaways/?tribe=${tribe.name.name}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const d = await tribeMembers.json();
                output.push(...d);
            } catch (error) {
                console.error("Error on Post", error);
            }
        } else {
            output.push(tribe.name.name);
        }
    });

    return output;
}

function notesToCastaways(notes: any[]): any[] {
    var output: any[] = [];
    notes.forEach(async (tribe) => {
        if (tribe.onModel === "Tribes") {
            console.log(tribe);
            try {
                const tribeMembers = await fetch(`/api/castaways/?tribe=${tribe.name}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const d = await tribeMembers.json();
                d.forEach((m: any) => {
                    output.push({
                        name: m.name,
                        notes: tribe.notes,
                    });
                });
            } catch (error) {
                console.error("Error on Post", error);
            }
        } else {
            output.push({
                name: tribe.name,
                notes: tribe.notes,
            });
        }
    });

    return output;
}



export default function AddEpisode() {
    const postEpisode = async (episode: any) => {
        var episodeModel = {
            number: episode.number,
            title: episode.title,
            airDate: episode.airDate + " 8:00PM EST",
            season: "Survivor 45",
            e_advFound: episode.advsFound,
            e_advPlay: episode.advPlaysSelf.concat(episode.advPlaysOther),
            e_badAdvPlay: episode.badAdvPlays,
            e_advElim: episode.advsEliminated,
            e_spokeEpTitle: episode.spokeEpTitle,
            e_tribe1st: tribesToCastaways(episode.tribe1sts),
            e_tribe2nd: tribesToCastaways(episode.tribe2nds),
            e_indivWin: episode.indivWins,
            e_indivReward: episode.indivRewards,
            e_finalThree: episode.finalThree,
            e_fireWin: episode.fireWins,
            e_soleSurvivor: episode.soleSurvivor,
            e_eliminated: episode.eliminated,
            e_noVoteExit: [], // update DATA
            e_tribeUpdate: episode.tribeUpdates.map((t: any) => {
                return {
                    tribe: t.tribe,
                    castaways: t.survivors,
                };
            }),
            e_notes: notesToCastaways(episode.notes),
        };

        try {
            const res = await fetch("/api/addEpisode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(episodeModel),
            });

            if (!res.ok) {
                console.error("failed", res.statusText);
            }

            const data = await res.json();
            console.log("success", data);
        } catch (error) {
            console.error("Error on Post", error);
        }
    };

    return (
        <button onClick={async () => episodes.forEach(async (e) => await postEpisode(e))}>
            AddEp
        </button>);
}
