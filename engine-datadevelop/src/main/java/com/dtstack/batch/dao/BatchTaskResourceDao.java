/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.dtstack.batch.dao;

import com.dtstack.batch.domain.BatchTaskResource;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface BatchTaskResourceDao {

    /**
     * @param taskId
     * @param resourceType  资源类型 -- ResourceRefType
     * @return
     */
    List<BatchTaskResource> listByTaskId(@Param("taskId") Long taskId, @Param("resourceType") Integer resourceType);

    BatchTaskResource getByTaskIdAndResourceId(@Param("taskId") Long taskId, @Param("resourceId") Long resourceId, @Param("resourceType") Integer resourceType);

    Integer deleteByTaskId(@Param("taskId") Long taskId, @Param("resourceType") Integer resourceType);

    Integer logicDeleteByTaskId(@Param("taskId") Long taskId, @Param("resourceType") Integer resourceType);

    List<BatchTaskResource> listByResourceId(@Param("resourceId") Long resourceId);

    Integer insert(BatchTaskResource batchTaskResource);

    Integer update(BatchTaskResource batchTaskResource);

    Integer deleteByTenantId(@Param("tenantId") Long tenantId);
}
