# API Documentation

## TaskController

---
### create

> BASIC

**Path:** /api/tasks

**Method:** POST


> REQUEST

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| Content-Type | application/json | NO |  |

**Request Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| id | long |  |
| title | string |  |
| description | string |  |
| status | string | PENDING<br>IN_PROGRESS<br>COMPLETED<br>FAILED |
| priority | string | LOW :Low priority - routine requests with no time pressure.<br>Suitable for general inquiries, feature requests, or minor issues<br>that can be addressed when resources are available.<br>MEDIUM :Medium priority - standard requests requiring timely attention.<br>Represents typical support tickets that should be handled within<br>normal service level agreements.<br>HIGH :High priority - important issues requiring prompt resolution.<br>Used for significant problems affecting user productivity or<br>business operations that need quick attention.<br>CRITICAL :Critical priority - urgent issues requiring immediate action.<br>Reserved for system outages, security incidents, or severe problems<br>that block critical business functions and demand instant response. |
| progress | int |  |
| dueDate | datetime |  |
| createdAt | datetime |  |
| updatedAt | datetime |  |
| assignedMemberId | long |  |

**Request Demo:**

```json
{
  "id": 0,
  "title": "",
  "description": "",
  "status": "",
  "priority": "",
  "progress": 0,
  "dueDate": null,
  "createdAt": null,
  "updatedAt": null,
  "assignedMemberId": 0
}
```

> RESPONSE

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| headers | map |  |
| body | object |  |
| &ensp;&ensp;&#124;─id | long |  |
| &ensp;&ensp;&#124;─title | string |  |
| &ensp;&ensp;&#124;─description | string |  |
| &ensp;&ensp;&#124;─status | string | PENDING<br>IN_PROGRESS<br>COMPLETED<br>FAILED |
| &ensp;&ensp;&#124;─priority | string | LOW :Low priority - routine requests with no time pressure.<br>Suitable for general inquiries, feature requests, or minor issues<br>that can be addressed when resources are available.<br>MEDIUM :Medium priority - standard requests requiring timely attention.<br>Represents typical support tickets that should be handled within<br>normal service level agreements.<br>HIGH :High priority - important issues requiring prompt resolution.<br>Used for significant problems affecting user productivity or<br>business operations that need quick attention.<br>CRITICAL :Critical priority - urgent issues requiring immediate action.<br>Reserved for system outages, security incidents, or severe problems<br>that block critical business functions and demand instant response. |
| &ensp;&ensp;&#124;─progress | int |  |
| &ensp;&ensp;&#124;─dueDate | datetime |  |
| &ensp;&ensp;&#124;─createdAt | datetime |  |
| &ensp;&ensp;&#124;─updatedAt | datetime |  |
| &ensp;&ensp;&#124;─assignedMemberId | long |  |
| status | object |  |
| &ensp;&ensp;&#124;─1xxInformational | boolean |  |
| &ensp;&ensp;&#124;─2xxSuccessful | boolean |  |
| &ensp;&ensp;&#124;─3xxRedirection | boolean |  |
| &ensp;&ensp;&#124;─4xxClientError | boolean |  |
| &ensp;&ensp;&#124;─5xxServerError | boolean |  |
| &ensp;&ensp;&#124;─error | boolean |  |
| statusCode | object |  |
| &ensp;&ensp;&#124;─1xxInformational | boolean |  |
| &ensp;&ensp;&#124;─2xxSuccessful | boolean |  |
| &ensp;&ensp;&#124;─3xxRedirection | boolean |  |
| &ensp;&ensp;&#124;─4xxClientError | boolean |  |
| &ensp;&ensp;&#124;─5xxServerError | boolean |  |
| &ensp;&ensp;&#124;─error | boolean |  |
| statusCodeValue | int |  |

**Response Demo:**

```json
{
  "headers": {
    "": null
  },
  "body": {
    "id": 0,
    "title": "",
    "description": "",
    "status": "",
    "priority": "",
    "progress": 0,
    "dueDate": null,
    "createdAt": null,
    "updatedAt": null,
    "assignedMemberId": 0
  },
  "status": {
    "1xxInformational": false,
    "2xxSuccessful": false,
    "3xxRedirection": false,
    "4xxClientError": false,
    "5xxServerError": false,
    "error": false
  },
  "statusCode": {
    "1xxInformational": false,
    "2xxSuccessful": false,
    "3xxRedirection": false,
    "4xxClientError": false,
    "5xxServerError": false,
    "error": false
  },
  "statusCodeValue": 0
}
```

---
### getAll

> BASIC

**Path:** /api/tasks

**Method:** GET


> REQUEST



> RESPONSE

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| headers | map |  |
| body | object[] |  |
| &ensp;&ensp;&#124;─id | long |  |
| &ensp;&ensp;&#124;─title | string |  |
| &ensp;&ensp;&#124;─description | string |  |
| &ensp;&ensp;&#124;─status | string | PENDING<br>IN_PROGRESS<br>COMPLETED<br>FAILED |
| &ensp;&ensp;&#124;─priority | string | LOW :Low priority - routine requests with no time pressure.<br>Suitable for general inquiries, feature requests, or minor issues<br>that can be addressed when resources are available.<br>MEDIUM :Medium priority - standard requests requiring timely attention.<br>Represents typical support tickets that should be handled within<br>normal service level agreements.<br>HIGH :High priority - important issues requiring prompt resolution.<br>Used for significant problems affecting user productivity or<br>business operations that need quick attention.<br>CRITICAL :Critical priority - urgent issues requiring immediate action.<br>Reserved for system outages, security incidents, or severe problems<br>that block critical business functions and demand instant response. |
| &ensp;&ensp;&#124;─progress | int |  |
| &ensp;&ensp;&#124;─dueDate | datetime |  |
| &ensp;&ensp;&#124;─createdAt | datetime |  |
| &ensp;&ensp;&#124;─updatedAt | datetime |  |
| &ensp;&ensp;&#124;─assignedMemberId | long |  |
| status | object |  |
| &ensp;&ensp;&#124;─1xxInformational | boolean |  |
| &ensp;&ensp;&#124;─2xxSuccessful | boolean |  |
| &ensp;&ensp;&#124;─3xxRedirection | boolean |  |
| &ensp;&ensp;&#124;─4xxClientError | boolean |  |
| &ensp;&ensp;&#124;─5xxServerError | boolean |  |
| &ensp;&ensp;&#124;─error | boolean |  |
| statusCode | object |  |
| &ensp;&ensp;&#124;─1xxInformational | boolean |  |
| &ensp;&ensp;&#124;─2xxSuccessful | boolean |  |
| &ensp;&ensp;&#124;─3xxRedirection | boolean |  |
| &ensp;&ensp;&#124;─4xxClientError | boolean |  |
| &ensp;&ensp;&#124;─5xxServerError | boolean |  |
| &ensp;&ensp;&#124;─error | boolean |  |
| statusCodeValue | int |  |

**Response Demo:**

```json
{
  "headers": {
    "": null
  },
  "body": [
    {
      "id": 0,
      "title": "",
      "description": "",
      "status": "",
      "priority": "",
      "progress": 0,
      "dueDate": null,
      "createdAt": null,
      "updatedAt": null,
      "assignedMemberId": 0
    }
  ],
  "status": {
    "1xxInformational": false,
    "2xxSuccessful": false,
    "3xxRedirection": false,
    "4xxClientError": false,
    "5xxServerError": false,
    "error": false
  },
  "statusCode": {
    "1xxInformational": false,
    "2xxSuccessful": false,
    "3xxRedirection": false,
    "4xxClientError": false,
    "5xxServerError": false,
    "error": false
  },
  "statusCodeValue": 0
}
```

---
### getById

> BASIC

**Path:** /api/tasks/{id}

**Method:** GET


> REQUEST

**Path Params:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| id |  | NO |  |


> RESPONSE

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| headers | map |  |
| body | object |  |
| &ensp;&ensp;&#124;─id | long |  |
| &ensp;&ensp;&#124;─title | string |  |
| &ensp;&ensp;&#124;─description | string |  |
| &ensp;&ensp;&#124;─status | string | PENDING<br>IN_PROGRESS<br>COMPLETED<br>FAILED |
| &ensp;&ensp;&#124;─priority | string | LOW :Low priority - routine requests with no time pressure.<br>Suitable for general inquiries, feature requests, or minor issues<br>that can be addressed when resources are available.<br>MEDIUM :Medium priority - standard requests requiring timely attention.<br>Represents typical support tickets that should be handled within<br>normal service level agreements.<br>HIGH :High priority - important issues requiring prompt resolution.<br>Used for significant problems affecting user productivity or<br>business operations that need quick attention.<br>CRITICAL :Critical priority - urgent issues requiring immediate action.<br>Reserved for system outages, security incidents, or severe problems<br>that block critical business functions and demand instant response. |
| &ensp;&ensp;&#124;─progress | int |  |
| &ensp;&ensp;&#124;─dueDate | datetime |  |
| &ensp;&ensp;&#124;─createdAt | datetime |  |
| &ensp;&ensp;&#124;─updatedAt | datetime |  |
| &ensp;&ensp;&#124;─assignedMemberId | long |  |
| status | object |  |
| &ensp;&ensp;&#124;─1xxInformational | boolean |  |
| &ensp;&ensp;&#124;─2xxSuccessful | boolean |  |
| &ensp;&ensp;&#124;─3xxRedirection | boolean |  |
| &ensp;&ensp;&#124;─4xxClientError | boolean |  |
| &ensp;&ensp;&#124;─5xxServerError | boolean |  |
| &ensp;&ensp;&#124;─error | boolean |  |
| statusCode | object |  |
| &ensp;&ensp;&#124;─1xxInformational | boolean |  |
| &ensp;&ensp;&#124;─2xxSuccessful | boolean |  |
| &ensp;&ensp;&#124;─3xxRedirection | boolean |  |
| &ensp;&ensp;&#124;─4xxClientError | boolean |  |
| &ensp;&ensp;&#124;─5xxServerError | boolean |  |
| &ensp;&ensp;&#124;─error | boolean |  |
| statusCodeValue | int |  |

**Response Demo:**

```json
{
  "headers": {
    "": null
  },
  "body": {
    "id": 0,
    "title": "",
    "description": "",
    "status": "",
    "priority": "",
    "progress": 0,
    "dueDate": null,
    "createdAt": null,
    "updatedAt": null,
    "assignedMemberId": 0
  },
  "status": {
    "1xxInformational": false,
    "2xxSuccessful": false,
    "3xxRedirection": false,
    "4xxClientError": false,
    "5xxServerError": false,
    "error": false
  },
  "statusCode": {
    "1xxInformational": false,
    "2xxSuccessful": false,
    "3xxRedirection": false,
    "4xxClientError": false,
    "5xxServerError": false,
    "error": false
  },
  "statusCodeValue": 0
}
```

---
### update

> BASIC

**Path:** /api/tasks/{id}

**Method:** PUT


> REQUEST

**Path Params:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| id |  | NO |  |

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| Content-Type | application/json | NO |  |

**Request Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| id | long |  |
| title | string |  |
| description | string |  |
| status | string | PENDING<br>IN_PROGRESS<br>COMPLETED<br>FAILED |
| priority | string | LOW :Low priority - routine requests with no time pressure.<br>Suitable for general inquiries, feature requests, or minor issues<br>that can be addressed when resources are available.<br>MEDIUM :Medium priority - standard requests requiring timely attention.<br>Represents typical support tickets that should be handled within<br>normal service level agreements.<br>HIGH :High priority - important issues requiring prompt resolution.<br>Used for significant problems affecting user productivity or<br>business operations that need quick attention.<br>CRITICAL :Critical priority - urgent issues requiring immediate action.<br>Reserved for system outages, security incidents, or severe problems<br>that block critical business functions and demand instant response. |
| progress | int |  |
| dueDate | datetime |  |
| createdAt | datetime |  |
| updatedAt | datetime |  |
| assignedMemberId | long |  |

**Request Demo:**

```json
{
  "id": 0,
  "title": "",
  "description": "",
  "status": "",
  "priority": "",
  "progress": 0,
  "dueDate": null,
  "createdAt": null,
  "updatedAt": null,
  "assignedMemberId": 0
}
```

> RESPONSE

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| headers | map |  |
| body | object |  |
| &ensp;&ensp;&#124;─id | long |  |
| &ensp;&ensp;&#124;─title | string |  |
| &ensp;&ensp;&#124;─description | string |  |
| &ensp;&ensp;&#124;─status | string | PENDING<br>IN_PROGRESS<br>COMPLETED<br>FAILED |
| &ensp;&ensp;&#124;─priority | string | LOW :Low priority - routine requests with no time pressure.<br>Suitable for general inquiries, feature requests, or minor issues<br>that can be addressed when resources are available.<br>MEDIUM :Medium priority - standard requests requiring timely attention.<br>Represents typical support tickets that should be handled within<br>normal service level agreements.<br>HIGH :High priority - important issues requiring prompt resolution.<br>Used for significant problems affecting user productivity or<br>business operations that need quick attention.<br>CRITICAL :Critical priority - urgent issues requiring immediate action.<br>Reserved for system outages, security incidents, or severe problems<br>that block critical business functions and demand instant response. |
| &ensp;&ensp;&#124;─progress | int |  |
| &ensp;&ensp;&#124;─dueDate | datetime |  |
| &ensp;&ensp;&#124;─createdAt | datetime |  |
| &ensp;&ensp;&#124;─updatedAt | datetime |  |
| &ensp;&ensp;&#124;─assignedMemberId | long |  |
| status | object |  |
| &ensp;&ensp;&#124;─1xxInformational | boolean |  |
| &ensp;&ensp;&#124;─2xxSuccessful | boolean |  |
| &ensp;&ensp;&#124;─3xxRedirection | boolean |  |
| &ensp;&ensp;&#124;─4xxClientError | boolean |  |
| &ensp;&ensp;&#124;─5xxServerError | boolean |  |
| &ensp;&ensp;&#124;─error | boolean |  |
| statusCode | object |  |
| &ensp;&ensp;&#124;─1xxInformational | boolean |  |
| &ensp;&ensp;&#124;─2xxSuccessful | boolean |  |
| &ensp;&ensp;&#124;─3xxRedirection | boolean |  |
| &ensp;&ensp;&#124;─4xxClientError | boolean |  |
| &ensp;&ensp;&#124;─5xxServerError | boolean |  |
| &ensp;&ensp;&#124;─error | boolean |  |
| statusCodeValue | int |  |

**Response Demo:**

```json
{
  "headers": {
    "": null
  },
  "body": {
    "id": 0,
    "title": "",
    "description": "",
    "status": "",
    "priority": "",
    "progress": 0,
    "dueDate": null,
    "createdAt": null,
    "updatedAt": null,
    "assignedMemberId": 0
  },
  "status": {
    "1xxInformational": false,
    "2xxSuccessful": false,
    "3xxRedirection": false,
    "4xxClientError": false,
    "5xxServerError": false,
    "error": false
  },
  "statusCode": {
    "1xxInformational": false,
    "2xxSuccessful": false,
    "3xxRedirection": false,
    "4xxClientError": false,
    "5xxServerError": false,
    "error": false
  },
  "statusCodeValue": 0
}
```

---
### delete

> BASIC

**Path:** /api/tasks/{id}

**Method:** DELETE


> REQUEST

**Path Params:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| id |  | NO |  |


> RESPONSE

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| headers | map |  |
| body | object |  |
| status | object |  |
| &ensp;&ensp;&#124;─1xxInformational | boolean |  |
| &ensp;&ensp;&#124;─2xxSuccessful | boolean |  |
| &ensp;&ensp;&#124;─3xxRedirection | boolean |  |
| &ensp;&ensp;&#124;─4xxClientError | boolean |  |
| &ensp;&ensp;&#124;─5xxServerError | boolean |  |
| &ensp;&ensp;&#124;─error | boolean |  |
| statusCode | object |  |
| &ensp;&ensp;&#124;─1xxInformational | boolean |  |
| &ensp;&ensp;&#124;─2xxSuccessful | boolean |  |
| &ensp;&ensp;&#124;─3xxRedirection | boolean |  |
| &ensp;&ensp;&#124;─4xxClientError | boolean |  |
| &ensp;&ensp;&#124;─5xxServerError | boolean |  |
| &ensp;&ensp;&#124;─error | boolean |  |
| statusCodeValue | int |  |

**Response Demo:**

```json
{
  "headers": {
    "": null
  },
  "body": {  },
  "status": {
    "1xxInformational": false,
    "2xxSuccessful": false,
    "3xxRedirection": false,
    "4xxClientError": false,
    "5xxServerError": false,
    "error": false
  },
  "statusCode": {
    "1xxInformational": false,
    "2xxSuccessful": false,
    "3xxRedirection": false,
    "4xxClientError": false,
    "5xxServerError": false,
    "error": false
  },
  "statusCodeValue": 0
}
```

---
### search

> BASIC

**Path:** /api/tasks/search

**Method:** POST


> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| page |  | NO |  |
| size |  | NO |  |
| sortBy |  | NO |  |
| order |  | NO |  |

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| Content-Type | application/json | NO |  |

**Request Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| title | string |  |
| status | string | PENDING<br>IN_PROGRESS<br>COMPLETED<br>FAILED |
| priority | string | LOW :Low priority - routine requests with no time pressure.<br>Suitable for general inquiries, feature requests, or minor issues<br>that can be addressed when resources are available.<br>MEDIUM :Medium priority - standard requests requiring timely attention.<br>Represents typical support tickets that should be handled within<br>normal service level agreements.<br>HIGH :High priority - important issues requiring prompt resolution.<br>Used for significant problems affecting user productivity or<br>business operations that need quick attention.<br>CRITICAL :Critical priority - urgent issues requiring immediate action.<br>Reserved for system outages, security incidents, or severe problems<br>that block critical business functions and demand instant response. |
| assignedMemberId | long |  |
| dueDateFrom | datetime |  |
| dueDateTo | datetime |  |
| createdFrom | datetime |  |
| createdTo | datetime |  |

**Request Demo:**

```json
{
  "title": "",
  "status": "",
  "priority": "",
  "assignedMemberId": 0,
  "dueDateFrom": null,
  "dueDateTo": null,
  "createdFrom": null,
  "createdTo": null
}
```

> RESPONSE

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| totalPages | int | Returns the number of total pages. |
| totalElements | long | Returns the total amount of elements. |
| number | int | Returns the number of the current{@link Slice}. Is always non-negative. |
| size | int | Returns the size of the{@link Slice}. |
| numberOfElements | int | Returns the number of elements currently on this{@link Slice}. |
| content | object[] | Returns the page content as{@link List}. |
| &ensp;&ensp;&#124;─id | long |  |
| &ensp;&ensp;&#124;─title | string |  |
| &ensp;&ensp;&#124;─description | string |  |
| &ensp;&ensp;&#124;─status | string | PENDING<br>IN_PROGRESS<br>COMPLETED<br>FAILED |
| &ensp;&ensp;&#124;─priority | string | LOW :Low priority - routine requests with no time pressure.<br>Suitable for general inquiries, feature requests, or minor issues<br>that can be addressed when resources are available.<br>MEDIUM :Medium priority - standard requests requiring timely attention.<br>Represents typical support tickets that should be handled within<br>normal service level agreements.<br>HIGH :High priority - important issues requiring prompt resolution.<br>Used for significant problems affecting user productivity or<br>business operations that need quick attention.<br>CRITICAL :Critical priority - urgent issues requiring immediate action.<br>Reserved for system outages, security incidents, or severe problems<br>that block critical business functions and demand instant response. |
| &ensp;&ensp;&#124;─progress | int |  |
| &ensp;&ensp;&#124;─dueDate | datetime |  |
| &ensp;&ensp;&#124;─createdAt | datetime |  |
| &ensp;&ensp;&#124;─updatedAt | datetime |  |
| &ensp;&ensp;&#124;─assignedMemberId | long |  |
| sort | object | Returns the sorting parameters for the{@link Slice}. |
| &ensp;&ensp;&#124;─orders | object[] |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─direction | string | ASC<br>DESC |
| &ensp;&ensp;&ensp;&ensp;&#124;─property | string |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─ignoreCase | boolean |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─nullHandling | string | NATIVE :Lets the data store decide what to do with nulls.<br>NULLS_FIRST :A hint to the used data store to order entries with null values before non null entries.<br>NULLS_LAST :A hint to the used data store to order entries with null values after non null entries. |
| &ensp;&ensp;&ensp;&ensp;&#124;─ascending | boolean | Returns whether sorting for this property shall be ascending. |
| &ensp;&ensp;&ensp;&ensp;&#124;─descending | boolean | Returns whether sorting for this property shall be descending. |
| &ensp;&ensp;&#124;─sorted | boolean |  |
| &ensp;&ensp;&#124;─empty | boolean |  |
| &ensp;&ensp;&#124;─unsorted | boolean |  |
| first | boolean | Returns whether the current{@link Slice} is the first one. |
| last | boolean | Returns whether the current{@link Slice} is the last one. |
| pageable | object | Returns the{@link Pageable} that's been used to request the current{@link Slice}. |
| &ensp;&ensp;&#124;─paged | boolean | Returns whether the current{@link Pageable} contains pagination information. |
| &ensp;&ensp;&#124;─unpaged | boolean | Returns whether the current{@link Pageable} does not contain pagination information. |
| &ensp;&ensp;&#124;─pageNumber | int | Returns the page to be returned. |
| &ensp;&ensp;&#124;─pageSize | int | Returns the number of items to be returned. |
| &ensp;&ensp;&#124;─offset | long | Returns the offset to be taken according to the underlying page and page size. |
| &ensp;&ensp;&#124;─sort | object | Returns the sorting parameters. |
| &ensp;&ensp;&ensp;&ensp;&#124;─orders | object[] |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─direction | string | ASC<br>DESC |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─property | string |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─ignoreCase | boolean |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─nullHandling | string | NATIVE :Lets the data store decide what to do with nulls.<br>NULLS_FIRST :A hint to the used data store to order entries with null values before non null entries.<br>NULLS_LAST :A hint to the used data store to order entries with null values after non null entries. |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─ascending | boolean | Returns whether sorting for this property shall be ascending. |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─descending | boolean | Returns whether sorting for this property shall be descending. |
| &ensp;&ensp;&ensp;&ensp;&#124;─sorted | boolean |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─empty | boolean |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─unsorted | boolean |  |
| empty | boolean | Returns whether the current{@link Streamable} is empty. |

**Response Demo:**

```json
{
  "totalPages": 0,
  "totalElements": 0,
  "number": 0,
  "size": 0,
  "numberOfElements": 0,
  "content": [
    {
      "id": 0,
      "title": "",
      "description": "",
      "status": "",
      "priority": "",
      "progress": 0,
      "dueDate": null,
      "createdAt": null,
      "updatedAt": null,
      "assignedMemberId": 0
    }
  ],
  "sort": {
    "orders": [
      {
        "direction": "",
        "property": "",
        "ignoreCase": false,
        "nullHandling": "",
        "ascending": false,
        "descending": false
      }
    ],
    "sorted": false,
    "empty": false,
    "unsorted": false
  },
  "first": false,
  "last": false,
  "pageable": {
    "paged": false,
    "unpaged": false,
    "pageNumber": 0,
    "pageSize": 0,
    "offset": 0,
    "sort": {
      "orders": [
        {
          "direction": "",
          "property": "",
          "ignoreCase": false,
          "nullHandling": "",
          "ascending": false,
          "descending": false
        }
      ],
      "sorted": false,
      "empty": false,
      "unsorted": false
    }
  },
  "empty": false
}
```
