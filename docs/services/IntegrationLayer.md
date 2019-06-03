
---

**Creator:** Hansjörg ([@hschmidthh](github.com/hschmidthh)), Wice GmbH <br>
**Last Modified:** - <br>
**Last Modifier:** - <br>
**Version:** -  <br>

---

# Integration Layer Service

# Introduction

This document describes the evaluation of the Microservice "Integration Layer Service".

# Description

## Purpose of the Microservice Integration Content Repository

The current idea is that this services acts as an integration layer.

The integration layer is used to support integration patterns like splitter, filter, aggregator.

## Requirements for the Integration Layer Service

We will need a component within the Open Integration Hub which fulfill the following user stories.

| User story: | As a user I want to specify a data model and receive only data from different sources if they fulfill the specification of the data model |
| :--- | :--- |

| User story: | As a user I want to retrieve data from more than one source |
| :--- | :--- |

| User story: | As a user I want to aggregate data from different sources |
| :--- | :--- |

| User story: | As a user I want to split data from one source into different targets |
| :--- | :--- |


This will lead to the following use cases:

| Label        | USE CASE - Aggregate Data |
| :---  | :---  |
| **Actor:** | User |
| **Summary:** | Describes aggregation of data from different sources |
| **Trigger:** | A user wants to aggregate data |
| **Preconditions:** | Credentials for the user are given |
| **Main Success Scenario:** | Data is validated and aggregated |
| **Failure Scenario:** | Aggregation failed |
| **Basic Workflow:** | 1. Define data model <br/> 2. Define common identifier <br/> 3. Define IlaId  <br/> 4. Define flow for source one <br/> 5. Define flow for source two <br/>  6. Define target source <br/> 7. Start Flow one <br/> 8. Start flow two <br/> 9. Start flow three |
| **Alternative Workflow:** | 1a. Sources or target unknown 2a. Incorrect flow defined <br/> 3a. Throw error   |

The Open Integration Hub has to know the restrictions for all connected applications. Each application has to communicate its restriction (minimal required attributes for a complete object) to the Open Integration Hub. If an update of the restrictions happens, these updates must be communicated to the OIH in order to ensure proper completeness checks. The Open Integration Hub has to compare the current message with these requirements and has to decide if the object is sent to the target application. If the message is not ready to be sent it can/must be temporarily stored until missing information is available.

# Technology Used

The service is a plain NodeJS microservice which stores its data in a MongoDB and is accessable via  REST-API

# Concept of the Integration Layer Service

![ILS schema](Assets/ILS.jpg)

As of now, the OIH can not directly transfer data from one flow to another. For aggregation, splitting and filtering we need such a functionality. Therefore we have to implement a temporary storage for the data. This is done by the Integration Layer Service.

The definition of the common data model can be sent via flow specification or pulled from the Meta Data Repository.

With a special adapter, called the Integration Layer Adapter, flows are able to communicate with the Integration Layer Service.

The Integration Layer Service verifies the incoming data from the different sources and if its corresponding and complete with the data model it will send the data to the outgoing flow.
