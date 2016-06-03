export = {
    "layers": [
        {
            "id": 34,
            "showLegend": false,
            "popupInfo": {
                "title": "Predominant Population in {SF1_States_STATE_NAME}",
                "fieldInfos": [
                    {
                        "fieldName": "OBJECTID",
                        "label": "OBJECTID",
                        "isEditable": false,
                        "visible": false
                    },
                    {
                        "fieldName": "Shape",
                        "label": "Shape",
                        "isEditable": false,
                        "visible": false
                    },
                    {
                        "fieldName": "SF1_States_ID",
                        "label": "ID",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "SF1_States_STATE_NAME",
                        "label": "STATE_NAME",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "SF1_States_ST_ABBREV",
                        "label": "ST_ABBREV",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "SF1_States_TOTPOP10",
                        "label": "TOTPOP10",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 0,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_States_PctWhite",
                        "label": "Percent White 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_States_PctBlack",
                        "label": "Percent Black 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_States_PctAmerInd",
                        "label": "Percent American Indian 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_States_PctPacific",
                        "label": "Percent Pacific Islander 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_States_PctOther",
                        "label": "Percent Other 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_States_PctHispanic",
                        "label": "Percent Hispanic i2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_States_Pct2Races",
                        "label": "Percent 2 or more races 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "PredominantRaceEthnicity",
                        "label": "PredominantRaceEthnicity",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "Shape_Length",
                        "label": "Shape_Length",
                        "isEditable": false,
                        "visible": false,
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "Shape_Area",
                        "label": "Shape_Area",
                        "isEditable": false,
                        "visible": false,
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "DOMINANCE_VALUE",
                        "label": "Level of Predominance",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_States_Pct2Asian",
                        "label": "Percent Asian 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    }
                ],
                "description": "In {SF1_States_STATE_NAME}, the total population is {SF1_States_TOTPOP10}. The predominant population group is {PredominantRaceEthnicity}, and the difference between it and the second largest group is {DOMINANCE_VALUE}% \n        ",
                "showAttachments": false,
                "mediaInfos": [
                    {
                        "title": "Breakdown",
                        "type": "piechart",
                        "caption": "Predominant racial or ethnic groups in the U.S.A. by county and tract, and the extent to which they predominant. Touch or mouse over the pie graph to see the actual values.",
                        "value": {
                            "fields": [
                                "SF1_States_PctWhite",
                                "SF1_States_PctBlack",
                                "SF1_States_PctAmerInd",
                                "SF1_States_PctPacific",
                                "SF1_States_PctOther",
                                "SF1_States_PctHispanic",
                                "SF1_States_Pct2Races",
                                "SF1_States_Pct2Asian"
                            ]
                        }
                    }
                ]
            }
        },
        {
            "id": 33,
            "showLegend": false,
            "popupInfo": {
                "title": "Predominant Population in {SF1_Counties_NAME}, {SF1_Counties_STATE_NAME}",
                "fieldInfos": [
                    {
                        "fieldName": "OBJECTID",
                        "label": "OBJECTID",
                        "isEditable": false,
                        "visible": false
                    },
                    {
                        "fieldName": "Shape",
                        "label": "Shape",
                        "isEditable": false,
                        "visible": false
                    },
                    {
                        "fieldName": "SF1_Counties_TOTPOP10",
                        "label": "TOTPOP10",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 0,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Counties_PctWhite",
                        "label": "Percent White 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Counties_PctBlack",
                        "label": "Percent Black 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Counties_PctAmerInd",
                        "label": "Percent American Indian 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Counties_PctPacific",
                        "label": "Percent Pacific Islander 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Counties_PctOther",
                        "label": "Percent Other 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Counties_PctHispanic",
                        "label": "Percent Hispanic 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "Dominance_Primary",
                        "label": "Dominance_Primary",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "Dominance_Primary_numbers",
                        "label": "Dominance_Primary_numbers",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "Dominance_secondary_numbers",
                        "label": "Dominance_secondary_numbers",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "Dominance_Secondary",
                        "label": "Dominance_Secondary",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "DOMINANCE_VALUE",
                        "label": "Level of predominance",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Counties_NAME",
                        "label": "NAME",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "SF1_Counties_STATE_NAME",
                        "label": "STATE_NAME",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "SF1_Counties_ST_ABBREV",
                        "label": "ST_ABBREV",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "SF1_Counties_AREA",
                        "label": "AREA",
                        "isEditable": false,
                        "visible": false,
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "Shape_Length",
                        "label": "Shape_Length",
                        "isEditable": false,
                        "visible": false,
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "Shape_Area",
                        "label": "Shape_Area",
                        "isEditable": false,
                        "visible": false,
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Counties_Pct2Asian",
                        "label": "Percent Asian 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    }
                ],
                "description": "In {SF1_Counties_NAME}, the total population is {SF1_Counties_TOTPOP10}. The predominant population group is {Dominance_Primary}, and the difference between it and the second largest group is {DOMINANCE_VALUE}% \n        ",
                "showAttachments": false,
                "mediaInfos": [
                    {
                        "title": "Breakdown",
                        "type": "piechart",
                        "caption": "The percentage of the total population represented by each racial or ethnic group in 2010. Touch or mouse over the pie graph to see the actual values.",
                        "value": {
                            "fields": [
                                "SF1_Counties_PctWhite",
                                "SF1_Counties_PctBlack",
                                "SF1_Counties_PctAmerInd",
                                "SF1_Counties_PctPacific",
                                "SF1_Counties_PctOther",
                                "SF1_Counties_PctHispanic",
                                "SF1_Counties_Pct2Asian"
                            ]
                        }
                    }
                ]
            }
        },
        {
            "id": 32,
            "showLegend": false,
            "popupInfo": {
                "title": "{COUNTY}, {SF1_Tracts_STATE_NAME} tract {SF1_Tracts_ID}",
                "fieldInfos": [
                    {
                        "fieldName": "OBJECTID",
                        "label": "OBJECTID",
                        "isEditable": false,
                        "visible": false
                    },
                    {
                        "fieldName": "Shape",
                        "label": "Shape",
                        "isEditable": false,
                        "visible": false
                    },
                    {
                        "fieldName": "SF1_Tracts_ID",
                        "label": "ID",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "SF1_Tracts_NAME",
                        "label": "NAME",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "SF1_Tracts_STATE_NAME",
                        "label": "STATE_NAME",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "SF1_Tracts_ST_ABBREV",
                        "label": "ST_ABBREV",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "SF1_Tracts_TOTPOP10",
                        "label": "TOTPOP10",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 0,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Tracts_PctWhite",
                        "label": "Percent White 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Tracts_PctBlack",
                        "label": "Percent Black 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Tracts_PctAmerInd",
                        "label": "Percent American Indian 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Tracts_PctPacific",
                        "label": "Percent Pacific Islander 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Tracts_PctOther",
                        "label": "Percent Other 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Tracts_PctHispanic",
                        "label": "Percent Hispanic 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Tracts_Pct2Races",
                        "label": "Percent 2 or more races 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "Dominance_Primary",
                        "label": "Dominance_Primary",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "Dominance_Primary_numbers",
                        "label": "Dominance_Primary_numbers",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "Dominance_secondary_numbers",
                        "label": "Dominance_secondary_numbers",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "Dominance_Secondary",
                        "label": "Dominance_Secondary",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "DOMINANCE_VALUE",
                        "label": "DOMINANCE_VALUE",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "COUNTY_NAME",
                        "label": "COUNTY_NAME",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "COUNTY_SUFFIX",
                        "label": "COUNTY_SUFFIX",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "COUNTY",
                        "label": "COUNTY",
                        "isEditable": false,
                        "visible": true,
                        "stringFieldOption": "textbox"
                    },
                    {
                        "fieldName": "Shape_Length",
                        "label": "Shape_Length",
                        "isEditable": false,
                        "visible": false,
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "Shape_Area",
                        "label": "Shape_Area",
                        "isEditable": false,
                        "visible": false,
                        "format": {
                            "places": 2,
                            "digitSeparator": true
                        }
                    },
                    {
                        "fieldName": "SF1_Tracts_Pct2Asian",
                        "label": "Percent Asian 2010",
                        "isEditable": false,
                        "visible": true,
                        "format": {
                            "places": 1,
                            "digitSeparator": true
                        }
                    }
                ],
                "description": "In this tract, the total population is {SF1_Tracts_TOTPOP10}. The predominant population group is {Dominance_Primary}, and the difference between it and the second largest group is {DOMINANCE_VALUE}% \n        ",
                "showAttachments": false,
                "mediaInfos": [
                    {
                        "title": "Breakdown",
                        "type": "piechart",
                        "caption": "The percentage of the total population represented by each racial or ethnic group in 2010. Touch or mouse over the pie graph to see the actual values.",
                        "value": {
                            "fields": [
                                "SF1_Tracts_PctWhite",
                                "SF1_Tracts_PctBlack",
                                "SF1_Tracts_PctAmerInd",
                                "SF1_Tracts_PctPacific",
                                "SF1_Tracts_PctOther",
                                "SF1_Tracts_PctHispanic",
                                "SF1_Tracts_Pct2Races",
                                "SF1_Tracts_Pct2Asian"
                            ]
                        }
                    }
                ]
            }
        },
        {
            "id": 1,
            "showLegend": false
        }
    ],
    "minScale": 147914382,
    "maxScale": 72223
};